import type { Metadata } from 'next';
import './globals.css';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { WalletContextProvider } from '@/components/WalletContextProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | SPL Token Creator',
    default: 'SPL Token Creator | Create Solana Tokens with Metadata',
  },
  description: 'Create SPL tokens on Solana blockchain with custom metadata and logo. Upload to IPFS via Pinata.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <NetworkProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </NetworkProvider>
      </body>
    </html>
  );
}
