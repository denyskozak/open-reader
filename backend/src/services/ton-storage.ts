import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type TonStorageUploadParams = {
  data: Buffer;
  fileName: string;
  contentType?: string;
};

export type TonStorageUploadResult = {
  key: string;
  url: string;
  size: number;
  mimeType?: string;
};

const DEFAULT_STORAGE_DIR = path.resolve(process.cwd(), 'storage', 'ton');
const DEFAULT_PUBLIC_BASE_URL = 'https://ton.storage/mock';

function resolveStorageDir(): string {
  const customDir = process.env.TON_STORAGE_LOCAL_DIR;
  return customDir ? path.resolve(customDir) : DEFAULT_STORAGE_DIR;
}

function resolvePublicBaseUrl(): string {
  const raw = process.env.TON_STORAGE_PUBLIC_URL;
  if (!raw) {
    return DEFAULT_PUBLIC_BASE_URL;
  }
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export async function uploadToTonStorage(
  params: TonStorageUploadParams,
): Promise<TonStorageUploadResult> {
  const storageDir = resolveStorageDir();
  await mkdir(storageDir, { recursive: true });

  const extension = path.extname(params.fileName);
  const key = `${randomUUID()}${extension}`;
  const absolutePath = path.join(storageDir, key);

  await writeFile(absolutePath, params.data);

  const publicBaseUrl = resolvePublicBaseUrl();
  const url = `${publicBaseUrl}/${key}`;

  return {
    key,
    url,
    size: params.data.byteLength,
    mimeType: params.contentType,
  };
}
