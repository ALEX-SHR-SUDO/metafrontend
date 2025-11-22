import ClientNFTCreator from '@/components/ClientNFTCreator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NFT Creator | Create Solana NFTs',
  description: 'Create NFTs on Solana blockchain with custom metadata and artwork.',
};

export default function CreateNFTPage() {
  return <ClientNFTCreator />;
}
