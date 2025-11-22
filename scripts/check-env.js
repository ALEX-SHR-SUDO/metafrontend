#!/usr/bin/env node

/**
 * Pre-build environment variable check
 * Validates that required environment variables are set for production builds
 */

const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
const rpcMainnet = process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET;

console.log('\n' + '='.repeat(60));
console.log('🔍 Environment Configuration Check');
console.log('='.repeat(60) + '\n');

console.log(`Network: ${network}`);
console.log(`Mainnet RPC: ${rpcMainnet ? '✅ Configured' : '❌ Not configured'}`);

// Check if building for mainnet without custom RPC
if (network === 'mainnet-beta' && (!rpcMainnet || rpcMainnet.trim() === '')) {
  console.log('\n' + '⚠️ '.repeat(30));
  console.log('\x1b[33m%s\x1b[0m', '⚠️  WARNING: Building for MAINNET without custom RPC endpoint!');
  console.log('⚠️ '.repeat(30) + '\n');
  console.log('Public Solana RPC endpoints are heavily rate-limited and WILL cause');
  console.log('403 errors during token operations on mainnet.\n');
  console.log('\x1b[1m%s\x1b[0m', 'RECOMMENDED ACTION:\n');
  console.log('1. Get a FREE RPC endpoint:');
  console.log('   • Helius: https://helius.dev (Recommended)');
  console.log('   • QuickNode: https://quicknode.com\n');
  console.log('2. Set environment variable in your deployment platform:\n');
  console.log('   \x1b[1m\x1b[32mNEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY\x1b[0m\n');
  console.log('3. For Vercel:');
  console.log('   • Go to Project Settings → Environment Variables');
  console.log('   • Add NEXT_PUBLIC_SOLANA_RPC_MAINNET');
  console.log('   • REDEPLOY after setting (critical!)');
  console.log('   • See VERCEL_RPC_SETUP.md for detailed instructions\n');
  console.log('4. For local development:');
  console.log('   • Create .env.local file');
  console.log('   • Add NEXT_PUBLIC_SOLANA_RPC_MAINNET=your_rpc_url');
  console.log('   • Restart development server\n');
  console.log('Build will continue, but mainnet functionality may be limited.');
  console.log('See RPC_CONFIGURATION.md for more information.\n');
  console.log('='.repeat(60) + '\n');
} else if (network === 'mainnet-beta' && rpcMainnet) {
  console.log('\n✅ Custom mainnet RPC endpoint is configured!');
  console.log('Your application will use a reliable RPC provider.\n');
  console.log('='.repeat(60) + '\n');
} else {
  console.log(`\nℹ️  Using ${network} network.`);
  if (network === 'devnet') {
    console.log('Public endpoints are generally sufficient for devnet testing.\n');
  }
  console.log('='.repeat(60) + '\n');
}
