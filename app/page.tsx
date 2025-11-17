import TokenCreator from '@/components/TokenCreator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SPL Token Creator | Create Solana Tokens with Metadata',
  description: 'Create SPL tokens on Solana blockchain with custom metadata and logo. Upload to IPFS via Pinata.',
};

export default function Home() {
  return <TokenCreator />;
}
