/**
 * Gets the Solana network from environment or defaults to devnet
 */
export function getSolanaNetwork(): string {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SOLANA_NETWORK) {
    return process.env.NEXT_PUBLIC_SOLANA_NETWORK;
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
