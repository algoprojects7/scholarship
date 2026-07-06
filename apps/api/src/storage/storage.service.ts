import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { SIGNED_URL_EXPIRY_SECONDS } from '../common/constants/application.constants';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private bucket = '';
  private useLocalStorage = true;
  private localUploadDir = '';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
    const secretKey = this.configService.get<string>('S3_SECRET_KEY');
    this.bucket =
      this.configService.get<string>('S3_BUCKET') ?? 'scholarship-docs';
    this.localUploadDir = join(process.cwd(), 'uploads');

    if (endpoint && accessKey && secretKey) {
      this.useLocalStorage = false;
      this.s3Client = new S3Client({
        endpoint,
        region: this.configService.get<string>('S3_REGION', 'us-east-1'),
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        forcePathStyle: true,
      });
      this.logger.log('Using S3/MinIO storage');
    } else {
      this.useLocalStorage = true;
      await mkdir(this.localUploadDir, { recursive: true });
      this.logger.log('Using local uploads/ storage (S3 not configured)');
    }
  }

  isLocalStorage(): boolean {
    return this.useLocalStorage;
  }

  getLocalFilePath(key: string): string {
    return join(this.localUploadDir, key);
  }

  async upload(
    file: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    if (this.useLocalStorage) {
      const filePath = this.getLocalFilePath(key);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, file);
      return key;
    }

    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async getSignedUrl(key: string): Promise<string> {
    if (this.useLocalStorage) {
      throw new Error('Signed URLs are not available in local storage mode');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client!, command, {
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    });
  }

  async delete(key: string): Promise<void> {
    if (this.useLocalStorage) {
      try {
        await unlink(this.getLocalFilePath(key));
      } catch {
        // File may already be removed
      }
      return;
    }

    await this.s3Client!.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
