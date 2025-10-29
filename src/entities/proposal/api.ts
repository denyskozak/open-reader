import type { BookProposal } from './types';
import { arrayBufferToBase64 } from '@/shared/lib/base64';

const DEFAULT_BACKEND_URL = 'http://localhost:3000';

function resolveBackendUrl(): string {
  const rawUrl = import.meta.env.VITE_BACKEND_URL ?? DEFAULT_BACKEND_URL;
  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
}

export type SubmitProposalPayload = {
  title: string;
  author: string;
  description: string;
  file: File;
};

export async function submitBookProposal(
  payload: SubmitProposalPayload,
): Promise<BookProposal> {
  const endpoint = `${resolveBackendUrl()}/proposals.create`;
  const fileBuffer = await payload.file.arrayBuffer();
  const base64 = await arrayBufferToBase64(fileBuffer);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Env': 'true',
    },
    body: JSON.stringify({
      title: payload.title,
      author: payload.author,
      description: payload.description,
      file: {
        name: payload.file.name,
        mimeType: payload.file.type || undefined,
        size: payload.file.size,
        content: base64,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit proposal: ${response.statusText}`);
  }

  const body = await response.json();

  if (body.error) {
    throw new Error(body.error.message ?? 'Unknown server error');
  }

  const data = body.result?.data?.json as BookProposal | undefined;

  if (!data) {
    throw new Error('Unexpected server response');
  }

  return data;
}
