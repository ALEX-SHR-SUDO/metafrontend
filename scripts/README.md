# Setup Scripts

This directory contains utility scripts for setting up and configuring the Solana Token Creator application.

## Available Scripts

### `setup-rpc.js`

Interactive setup script for configuring Solana RPC endpoints.

**Usage:**
```bash
npm run setup
```

This script will guide you through:
1. Selecting your target network (devnet or mainnet)
2. Configuring custom RPC endpoints
3. Setting up backend API URL
4. Creating a properly configured `.env.local` file

**When to use:**
- First time setup after cloning the repository
- When switching from devnet to mainnet
- When you need to update your RPC endpoints
- When you get 403 errors from public RPC endpoints

**Features:**
- Interactive prompts with sensible defaults
- Warns about mainnet requirements
- Checks for existing `.env.local` file
- Provides helpful guidance and links

### `postinstall.js`

Automatic post-installation message script that runs after `npm install`.

**Behavior:**
- Checks if `.env.local` exists
- If not, displays a welcome message with setup instructions
- Reminds users about RPC configuration requirements

**Note:** This script runs automatically and doesn't need to be invoked manually.

## Why These Scripts Matter

### The RPC Endpoint Problem

When using Solana blockchain, applications need to connect to an RPC (Remote Procedure Call) endpoint to interact with the network. There are two options:

1. **Public Endpoints** (Free but limited)
   - Heavily rate-limited
   - Shared by many users
   - Often return 403 errors on mainnet
   - Fine for devnet testing

2. **Custom Endpoints** (Recommended for mainnet)
   - Higher rate limits
   - More reliable
   - Better performance
   - Free tiers available from providers

### The Warning You Might See

If you run the app on mainnet without a custom RPC endpoint, you'll see:

```
⚠️ No custom RPC endpoint configured for mainnet! 
Public endpoints have strict rate limits and may return 403 errors.
Set NEXT_PUBLIC_SOLANA_RPC_MAINNET in .env.local.
Get a free endpoint from: https://helius.dev or https://quicknode.com
```

**This is by design!** The warning alerts you to configure a proper RPC endpoint before using mainnet.

## Quick Start

```bash
# After cloning and installing dependencies
npm run setup

# Follow the prompts
# ✅ Your .env.local is now configured!

# Start development
npm run dev
```

## Manual Setup Alternative

If you prefer manual setup:

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your preferred editor
nano .env.local  # or vim, code, etc.

# Add your RPC endpoints
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Getting an RPC Endpoint

### Recommended Providers

1. **Helius** (Easiest)
   - URL: https://helius.dev
   - Free tier: Available
   - Setup: 2 minutes
   - Quality: Excellent

2. **QuickNode**
   - URL: https://quicknode.com
   - Free tier: Available
   - Setup: 5 minutes
   - Quality: Excellent

3. **Alchemy**
   - URL: https://alchemy.com
   - Free tier: Available
   - Setup: 5 minutes
   - Quality: Good

All providers offer:
- Free tier for development
- Instant API key generation
- Straightforward setup
- Good documentation

## Documentation

For detailed information:
- [RPC_CONFIGURATION.md](../RPC_CONFIGURATION.md) - Complete RPC setup guide
- [README.md](../README.md) - Main project documentation
- [QUICK_START.md](../QUICK_START.md) - Quick start guide

## Troubleshooting

### "I already have .env.local but still see warnings"

The warnings appear if:
1. You're on mainnet without a custom RPC endpoint
2. Your RPC endpoint environment variable is empty or commented out
3. You haven't restarted the development server after adding the endpoint

**Solution:** Run `npm run setup` again and choose to overwrite, or manually check your `.env.local` file.

### "The setup script won't start"

Make sure you've installed dependencies:
```bash
npm install
```

### "I want to use different networks"

You can switch networks by:
1. Running `npm run setup` again
2. Or manually editing `.env.local` and changing `NEXT_PUBLIC_SOLANA_NETWORK`
3. Restart your dev server

## Contributing

If you improve these scripts or add new ones, please:
1. Update this README
2. Test thoroughly on both devnet and mainnet configurations
3. Ensure the scripts are user-friendly and informative

## Security Note

⚠️ **Never commit `.env.local` to version control!**

It's already in `.gitignore`, but double-check. Your RPC endpoint URLs may contain API keys that should remain private.
