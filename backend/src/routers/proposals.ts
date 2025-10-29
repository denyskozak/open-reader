import { Buffer } from 'node:buffer';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, procedure } from '../trpc/trpc.js';
import { prisma } from '../utils/prisma.js';
import { uploadToTonStorage } from '../services/ton-storage.js';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const createProposalInput = z.object({
  title: z.string().min(1).max(512),
  author: z.string().min(1).max(512),
  description: z.string().min(1),
  file: z.object({
    name: z.string().min(1).max(512),
    mimeType: z.string().min(1).max(128).optional(),
    size: z.number().int().nonnegative().max(MAX_FILE_SIZE_BYTES).optional(),
    content: z.string().min(1),
  }),
});

export const proposalsRouter = createRouter({
  create: procedure.input(createProposalInput).mutation(async ({ input }) => {
    const fileBuffer = Buffer.from(input.file.content, 'base64');

    if (input.file.size && input.file.size > MAX_FILE_SIZE_BYTES) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'File size exceeds the allowed limit' });
    }

    if (fileBuffer.byteLength === 0) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Uploaded file is empty' });
    }

    if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'File size exceeds the allowed limit' });
    }

    const uploadResult = await uploadToTonStorage({
      data: fileBuffer,
      fileName: input.file.name,
      contentType: input.file.mimeType,
    });

    const proposal = await prisma.bookProposal.create({
      data: {
        title: input.title,
        author: input.author,
        description: input.description,
        tonStorageKey: uploadResult.key,
        tonStorageUrl: uploadResult.url,
        fileName: input.file.name,
        fileSize: uploadResult.size,
        mimeType: uploadResult.mimeType,
      },
    });

    return proposal;
  }),
  list: procedure.query(async () => {
    const proposals = await prisma.bookProposal.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return proposals;
  }),
});
