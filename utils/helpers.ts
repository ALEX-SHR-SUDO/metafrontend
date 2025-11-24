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

/**
 * Creates a creator metadata array with the wallet as the sole creator
 * This is used for Metaplex Token Metadata to properly display creators on Solscan
 * 
 * @param address - The public key of the wallet creating the token/NFT
 * @returns An array with a single creator entry
 */
export function createCreatorMetadata(address: any) {
  return [
    {
      address,
      verified: true, // Creator is verified when they sign the transaction
      share: 100, // 100% of creator royalties
    },
  ];
}
