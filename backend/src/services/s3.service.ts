import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import fs from "fs/promises";
import path from "path";

export interface S3UploadResult {
  key: string;
  bucket: string;
  url?: string;
}

export class S3Service {
  private static client: S3Client | null = null;

  private static getConfig() {
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_S3_BUCKET;

    if (!region) {
      throw new Error("AWS_REGION is not configured.");
    }

    if (!bucket) {
      throw new Error("AWS_S3_BUCKET is not configured.");
    }

    return {
      region,
      bucket,
    };
  }

  private static getClient(): S3Client {
    if (this.client) {
      return this.client;
    }

    const { region } = this.getConfig();

    this.client = new S3Client({
      region,

      credentials:
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId:
                process.env.AWS_ACCESS_KEY_ID,

              secretAccessKey:
                process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    return this.client;
  }

  /* =========================================================================
     UPLOAD BUFFER
     ========================================================================= */

  static async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<S3UploadResult> {
    const client = this.getClient();
    const { bucket } = this.getConfig();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return {
      key,
      bucket,
    };
  }

  /* =========================================================================
     UPLOAD LOCAL FILE
     ========================================================================= */

  static async uploadFile(
    filePath: string,
    key: string,
    contentType: string
  ): Promise<S3UploadResult> {
    const buffer = await fs.readFile(filePath);

    return this.uploadBuffer(
      buffer,
      key,
      contentType
    );
  }

  /* =========================================================================
     DOWNLOAD FILE
     ========================================================================= */

  static async downloadFile(
    key: string
  ): Promise<Buffer> {
    const client = this.getClient();
    const { bucket } = this.getConfig();

    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      throw new Error(
        `S3 object body is empty for key: ${key}`
      );
    }

    const bytes =
      await response.Body.transformToByteArray();

    return Buffer.from(bytes);
  }

  /* =========================================================================
     DELETE FILE
     ========================================================================= */

  static async deleteFile(
    key: string
  ): Promise<void> {
    const client = this.getClient();
    const { bucket } = this.getConfig();

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }

  /* =========================================================================
     SIGNED URL
     ========================================================================= */

  static async getSignedUrl(
    key: string,
    expiresIn = 3600
  ): Promise<string> {
    const client = this.getClient();
    const { bucket } = this.getConfig();

    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      {
        expiresIn,
      },
    );
  }

  /* =========================================================================
     GENERATE RESUME KEY
     ========================================================================= */

  static generateResumeKey(
    userId: string,
    storedName: string
  ): string {
    const safeName = path
      .basename(storedName)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    return `resumes/${userId}/${safeName}`;
  }

  /* =========================================================================
     CHECK CONFIGURATION
     ========================================================================= */

  static isConfigured(): boolean {
    return Boolean(
      process.env.AWS_REGION &&
        process.env.AWS_S3_BUCKET
    );
  }
}

