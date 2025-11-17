import ClientAddMetadata from '@/components/ClientAddMetadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Metadata to Token | SPL Token Metadata',
  description: 'Add on-chain metadata to existing Solana SPL tokens. Upload logo and metadata to IPFS via Pinata.',
};

export default function AddMetadataPage() {
  return <ClientAddMetadata />;
}
