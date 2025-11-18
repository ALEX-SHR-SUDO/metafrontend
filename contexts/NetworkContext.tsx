'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SolanaNetwork = 'devnet' | 'mainnet-beta';

interface NetworkContextType {
  network: SolanaNetwork;
  setNetwork: (network: SolanaNetwork) => void;
  isMainnet: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  // Initialize with devnet as default
  const [network, setNetworkState] = useState<SolanaNetwork>('devnet');
  const [mounted, setMounted] = useState(false);

  // Load network preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedNetwork = localStorage.getItem('solana-network') as SolanaNetwork | null;
    if (savedNetwork && (savedNetwork === 'devnet' || savedNetwork === 'mainnet-beta')) {
      setNetworkState(savedNetwork);
    }
  }, []);

  // Save network preference to localStorage when it changes
  const setNetwork = (newNetwork: SolanaNetwork) => {
    setNetworkState(newNetwork);
    if (mounted) {
      localStorage.setItem('solana-network', newNetwork);
    }
  };

  const isMainnet = network === 'mainnet-beta';

  return (
    <NetworkContext.Provider value={{ network, setNetwork, isMainnet }}>
      {children}
    </NetworkContext.Provider>
  );
}
