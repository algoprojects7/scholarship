import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { del, head, list, put } from '@vercel/blob';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import {
  PRESIGNED_UPLOAD_EXPIRY_SECONDS,
  SIGNED_URL_EXPIRY_SECONDS,
} from '../common/constants/application.constants';

type StorageBackend = 'local' | 's3' | 'blob';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private backend: StorageBackend = 'local';
  private s3Client: S3Client | null = null;
  private bucket = '';
  private localUploadDir = '';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const blobToken = this.configService.get<string>('BLOB_READ_WRITE_TOKEN');
    const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
    const secretKey = this.configService.get<string>('S3_SECRET_KEY');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    this.bucket =
      this.configService.get<string>('S3_BUCKET') ?? 'scholarship-docs';
    this.localUploadDir = this.resolveLocalUploadDir();

    if (blobToken) {
      this.backend = 'blob';
      this.logger.log('Using Vercel Blob storage');
      return;
    }

    if (accessKey && secretKey) {
      this.backend = 's3';

      const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
        region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      };

      if (endpoint) {
        clientConfig.endpoint = endpoint;
        clientConfig.forcePathStyle =
          this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') ===
          'true';
      }

      this.s3Client = new S3Client(clientConfig);
      this.logger.log(
        endpoint
          ? `Using S3-compatible storage at ${endpoint}`
          : `Using Amazon S3 in ${region} (bucket: ${this.bucket})`,
      );
      return;
    }

    this.backend = 'local';
    await mkdir(this.localUploadDir, { recursive: true });
    this.logger.log(`Using local storage at ${this.localUploadDir}`);
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn(
        'No persistent storage configured. Connect Vercel Blob or set S3_* env vars.',
      );
    }
  }

  private resolveLocalUploadDir(): string {
    const configured = this.configService.get<string>('UPLOAD_DIR');
    if (configured) {
      return configured;
    }

    if (process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      return join('/tmp', 'uploads');
    }

    return join(process.cwd(), 'uploads');
  }

  isLocalStorage(): boolean {
    return this.backend === 'local';
  }

  isBlobStorage(): boolean {
    return this.backend === 'blob';
  }

  supportsPresignedUpload(): boolean {
    return this.backend === 's3';
  }

  getLocalFilePath(key: string): string {
    return join(this.localUploadDir, key);
  }

  async upload(
    file: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    if (this.backend === 'local') {
      const filePath = this.getLocalFilePath(key);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, file);
      return key;
    }

    if (this.backend === 'blob') {
      const blob = await put(key, file, {
        access: 'public',
        addRandomSuffix: false,
        contentType,
      });
      return blob.url;
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
    if (this.backend === 'blob') {
      return this.resolveBlobPublicUrl(key);
    }

    if (this.backend === 'local') {
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

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    if (this.backend !== 's3') {
      throw new Error('Presigned uploads are only available with S3 storage');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client!, command, {
      expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS,
    });
  }

  async getBlobDownloadUrl(blobUrl: string): Promise<string> {
    if (this.backend !== 'blob') {
      throw new Error('Blob download URLs are only available in blob mode');
    }

    try {
      const metadata = await head(blobUrl);
      return metadata.downloadUrl;
    } catch (err) {
      if (!blobUrl.startsWith('http')) {
        try {
          const publicUrl = await this.resolveBlobPublicUrl(blobUrl);
          const metadata = await head(publicUrl);
          return metadata.downloadUrl;
        } catch {
          // ignore
        }
      }
      throw err;
    }
  }

  async resolveBlobPublicUrl(fileRef: string): Promise<string> {
    if (this.backend !== 'blob') {
      throw new Error('Blob public URLs are only available in blob mode');
    }

    if (fileRef.startsWith('http')) {
      return fileRef;
    }

    try {
      const metadata = await head(fileRef);
      return metadata.url;
    } catch (err) {
      try {
        const lastSlash = fileRef.lastIndexOf('/');
        const prefix = lastSlash !== -1 ? fileRef.substring(0, lastSlash + 1) : '';
        const response = await list({ prefix });
        
        const found = response.blobs.find(b => 
          b.pathname === fileRef || 
          b.pathname.startsWith(fileRef.replace(/\.[^/.]+$/, ''))
        );
        if (found) {
          return found.url;
        }
      } catch (listErr) {
        this.logger.error(`Failed to list blobs for fallback of ${fileRef}:`, listErr);
      }
      throw err;
    }
  }

  async fetchFileContent(
    fileRef: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    if (this.backend === 'local') {
      const { readFile } = await import('fs/promises');
      const buffer = await readFile(this.getLocalFilePath(fileRef));
      return { buffer, contentType: 'application/octet-stream' };
    }

    if (this.backend === 'blob') {
      const downloadUrl = await this.getBlobDownloadUrl(fileRef);
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch blob file (${response.status})`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      return {
        buffer,
        contentType:
          response.headers.get('content-type') ?? 'application/octet-stream',
      };
    }

    const result = await this.s3Client!.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileRef,
      }),
    );

    if (!result.Body) {
      throw new Error('S3 object body is empty');
    }

    const buffer = Buffer.from(await result.Body.transformToByteArray());
    return {
      buffer,
      contentType: result.ContentType ?? 'application/octet-stream',
    };
  }

  async delete(fileRef: string): Promise<void> {
    if (this.backend === 'local') {
      try {
        await unlink(this.getLocalFilePath(fileRef));
      } catch {
        // File may already be removed
      }
      return;
    }

    if (this.backend === 'blob') {
      await del(fileRef);
      return;
    }

    await this.s3Client!.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileRef,
      }),
    );
  }
}

