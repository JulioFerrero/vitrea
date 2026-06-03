import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import process from "node:process";

function env(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

function getS3Client() {
  const endpoint = env("S3_ENDPOINT");
  const region = env("S3_REGION", "us-east-1")!;
  const accessKey = env("S3_ACCESS_KEY");
  const secretKey = env("S3_SECRET_KEY");
  const forcePathStyle = env("S3_FORCE_PATH_STYLE") === "true";

  return new S3Client({
    ...(endpoint ? { endpoint } : {}),
    region,
    ...(accessKey && secretKey
      ? { credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } }
      : {}),
    forcePathStyle,
  });
}

const bucket = () => env("S3_BUCKET", "images")!;

export function getAssetUrl(key: string): string {
  const baseUrl = env("ASSET_BASE_URL");
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}/${key}`;
  }

  const b = bucket();
  const ep = env("S3_ENDPOINT");
  const region = env("S3_REGION", "us-east-1")!;

  if (ep) {
    return `${ep.replace(/\/$/, "")}/${b}/${key}`;
  }

  return `https://${b}.s3.${region}.amazonaws.com/${key}`;
}

export interface UploadResult {
  key: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export async function uploadFile(
  file: File | Blob & { name?: string },
  opts?: { key?: string },
): Promise<UploadResult> {
  const s3 = getS3Client();
  const ext = file.name ? file.name.split(".").pop()?.toLowerCase() ?? "bin" : "bin";
  const key = opts?.key ?? `${nanoid(21)}.${ext}`;
  const buffer = await file.arrayBuffer();
  const contentType = file.type || "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: new Uint8Array(buffer),
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: getAssetUrl(key),
    name: file.name ?? key,
    type: contentType,
    size: file.size,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const s3 = getS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket(),
      Key: key,
    }),
  );
}

export function extractKeyFromUrl(url: string): string | null {
  const b = bucket();
  const idx = url.indexOf(`/${b}/`);
  if (idx === -1) return null;
  return url.slice(idx + b.length + 2);
}
