import {
  S3Client,
} from "@aws-sdk/client-s3";

const region =
  process.env.AWS_REGION;

const accessKeyId =
  process.env.AWS_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.AWS_SECRET_ACCESS_KEY;

if (!region) {
  throw new Error(
    "AWS_REGION is not configured"
  );
}

if (!accessKeyId) {
  throw new Error(
    "AWS_ACCESS_KEY_ID is not configured"
  );
}

if (!secretAccessKey) {
  throw new Error(
    "AWS_SECRET_ACCESS_KEY is not configured"
  );
}

export const s3Client =
  new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

export const S3_BUCKET =
  process.env.AWS_S3_BUCKET;

if (!S3_BUCKET) {
  throw new Error(
    "AWS_S3_BUCKET is not configured"
  );
}