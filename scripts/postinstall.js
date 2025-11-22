#!/usr/bin/env node

/**
 * Post-install message to guide users through setup
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Welcome to Solana Token Creator!');
  console.log('='.repeat(60));
  console.log('\n📋 Next Step: Configure your environment\n');
  console.log('Run the interactive setup:');
  console.log('  \x1b[1m\x1b[32mnpm run setup\x1b[0m\n');
  console.log('Or manually create .env.local:');
  console.log('  \x1b[2mcp .env.example .env.local\x1b[0m\n');
  console.log('⚠️  IMPORTANT: Custom RPC endpoints are REQUIRED for mainnet!');
  console.log('   See RPC_CONFIGURATION.md for details.');
  console.log('\n' + '='.repeat(60) + '\n');
}
