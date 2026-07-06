import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  HeadBucketCommand,
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
    const blobToken =
      this.configService.get<string>('BLOB_READ_WRITE_TOKEN') ??
      process.env.BLOB_READ_WRITE_TOKEN;
    const accessKey =
      this.configService.get<string>('S3_ACCESS_KEY') ??
      process.env.S3_ACCESS_KEY;
    const secretKey =
      this.configService.get<string>('S3_SECRET_KEY') ??
      process.env.S3_SECRET_KEY;
    const endpoint =
      this.configService.get<string>('S3_ENDPOINT') ??
      process.env.S3_ENDPOINT;
    const region =
      this.configService.get<string>('S3_REGION') ??
      process.env.S3_REGION ??
      'us-east-1';
    this.bucket =
      this.configService.get<string>('S3_BUCKET') ??
      process.env.S3_BUCKET ??
      'scholarship-docs';
    this.localUploadDir = this.resolveLocalUploadDir();

    if (blobToken && blobToken.trim() !== '') {
      this.backend = 'blob';
      this.logger.log('Using Vercel Blob storage (token auth)');
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

      // Verify S3 connectivity
      try {
        await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
        this.logger.log(
          endpoint
            ? `Using S3-compatible storage at ${endpoint} (bucket: ${this.bucket})`
            : `Using Amazon S3 in ${region} (bucket: ${this.bucket})`,
        );
      } catch (err: any) {
        // Fall back to local storage if it's a network error (unreachable)
        const isNetworkError =
          err.code === 'ECONNREFUSED' ||
          err.code === 'ENOTFOUND' ||
          err.code === 'ETIMEDOUT' ||
          err.name === 'TimeoutError' ||
          err.$metadata?.httpStatusCode === undefined;

        if (isNetworkError) {
          this.logger.warn(
            `S3 storage is configured but not reachable (${err.message || 'connection failed'}). Falling back to local storage.`,
          );
          this.backend = 'local';
          this.s3Client = null;
          await mkdir(this.localUploadDir, { recursive: true });
        } else {
          // If S3 is reachable but bucket or credentials have issues, we still log it but keep backend as s3
          this.logger.log(
            endpoint
              ? `Using S3-compatible storage at ${endpoint} (bucket: ${this.bucket}, verification: ${err.message})`
              : `Using Amazon S3 in ${region} (bucket: ${this.bucket}, verification: ${err.message})`,
          );
        }
      }
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

    const isServerless =
      process.env.VERCEL === '1' ||
      process.env.NOW_BUILDER === '1' ||
      !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
      !!process.env.VERCEL_ENV;

    if (isServerless) {
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
      const token =
        this.configService.get<string>('BLOB_READ_WRITE_TOKEN') ??
        process.env.BLOB_READ_WRITE_TOKEN;
      const accessInput =
        this.configService.get<string>('BLOB_ACCESS') ??
        process.env.BLOB_ACCESS ??
        'public';
      const access = accessInput === 'private' ? 'private' : 'public';

      this.logger.log(
        `Uploading blob. Key: ${key}. Access: ${access}. Has token: ${!!token}`,
      );

      try {
        const blob = await put(key, file, {
          access: access as any,
          addRandomSuffix: false,
          contentType,
          ...(token ? { token } : {}),
        });
        return blob.url;
      } catch (err: any) {
        this.logger.error(`Vercel Blob upload failed: ${err.message}`, err.stack);
        throw err;
      }
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

    if (!blobUrl.startsWith('http')) {
      throw new Error('Local relative paths are not available on Vercel Blob');
    }

    return blobUrl;
  }

  async resolveBlobPublicUrl(fileRef: string): Promise<string> {
    if (this.backend !== 'blob') {
      throw new Error('Blob public URLs are only available in blob mode');
    }

    if (fileRef.startsWith('http')) {
      return fileRef;
    }

    throw new Error('Local relative paths are not available on Vercel Blob');
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
      const token =
        this.configService.get<string>('BLOB_READ_WRITE_TOKEN') ??
        process.env.BLOB_READ_WRITE_TOKEN;

      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(downloadUrl, { headers });

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
      if (fileRef.startsWith('http')) {
        try {
          await del(fileRef);
        } catch (err: any) {
          this.logger.warn(`Failed to delete Vercel Blob file: ${err.message}`);
        }
      } else {
        this.logger.warn(
          `Skipping Vercel Blob deletion. File reference is not a URL: ${fileRef}`,
        );
      }
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

