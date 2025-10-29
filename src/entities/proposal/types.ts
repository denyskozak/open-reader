export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BookProposal = {
  id: string;
  title: string;
  author: string;
  description: string;
  tonStorageKey: string;
  tonStorageUrl: string;
  mimeType?: string | null;
  fileName: string;
  fileSize?: number | null;
  status: ProposalStatus;
  reviewerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};
