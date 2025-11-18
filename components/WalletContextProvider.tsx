'use client';

import React, { FC, ReactNode, useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js';
import { useNetwork } from '@/contexts/NetworkContext';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Track if component is mounted to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  const { network } = useNetwork();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert our network type to WalletAdapterNetwork
  const walletNetwork = network === 'mainnet-beta' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet;
  
  // Use custom RPC endpoints if provided, otherwise fall back to public endpoints
  const endpoint = useMemo(() => {
    if (network === 'mainnet-beta') {
      const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET;
      if (customEndpoint && customEndpoint.trim() !== '') {
        console.log('Using custom mainnet RPC endpoint');
        return customEndpoint;
      }
    } else if (network === 'devnet') {
      const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET;
      if (customEndpoint && customEndpoint.trim() !== '') {
        console.log('Using custom devnet RPC endpoint');
        return customEndpoint;
      }
    }
    
    // Fall back to public endpoints
    console.log('Using public RPC endpoint (may have rate limits)');
    return clusterApiUrl(walletNetwork);
  }, [network, walletNetwork]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Return children without wallet context during SSR to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
