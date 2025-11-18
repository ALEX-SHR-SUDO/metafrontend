import { SolanaNetwork } from '@/contexts/NetworkContext';

/**
 * Gets the Solana network from localStorage or defaults to devnet
 */
export function getSolanaNetwork(): SolanaNetwork {
  if (typeof window !== 'undefined') {
    const savedNetwork = localStorage.getItem('solana-network') as SolanaNetwork | null;
    if (savedNetwork && (savedNetwork === 'devnet' || savedNetwork === 'mainnet-beta')) {
      return savedNetwork;
    }
  }
  return 'devnet';
}

/**
 * Generates a Solana Explorer URL for a given address
 */
export function getSolanaExplorerUrl(address: string, cluster?: string): string {
  const network = cluster || getSolanaNetwork();
  return `https://explorer.solana.com/address/${address}?cluster=${network}`;
}

/**
 * Calculates token amount with decimals using BigInt for precision
 */
export function calculateTokenAmount(supply: number, decimals: number): bigint {
  const multiplier = BigInt(10 ** decimals);
  return BigInt(supply) * multiplier;
}
