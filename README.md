# Solana Token Creator with Metadata

A Next.js application for creating SPL tokens on Solana blockchain with full on-chain metadata support using Metaplex Token Metadata Program.

## Features

### 🎨 Create New Tokens
- Create SPL tokens with custom name, symbol, and logo
- Automatic on-chain metadata creation using Metaplex
- Upload logo and metadata to IPFS via Pinata
- Configurable decimals and initial supply
- Full integration with Solana wallet adapters

### ✨ Add Metadata to Existing Tokens
- Add metadata to tokens that were created without it
- Retroactively make tokens visible on blockchain explorers
- Upload logo and metadata to IPFS
- Link metadata to existing token mints

### 🔍 Blockchain Explorer Integration
- Tokens display correctly on Solscan.io
- Tokens display correctly on Solana Explorer
- Compatible with wallet applications
- DEX platform support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)
- SOL for transaction fees

### Installation

```bash
# Clone the repository
git clone https://github.com/ALEX-SHR-SUDO/metafrontend.git
cd metafrontend

# Install dependencies
npm install

# Run interactive setup (recommended)
npm run setup

# OR manually copy environment template
# cp .env.example .env.local
```

### Environment Variables

Edit `.env.local`:

```env
# Solana Network (devnet, testnet, or mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Custom RPC Endpoints (REQUIRED for mainnet to avoid 403 errors)
# Get free API keys from Helius, QuickNode, or Alchemy
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
NEXT_PUBLIC_SOLANA_RPC_DEVNET=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY

# Backend API URL for IPFS uploads
NEXT_PUBLIC_BACKEND_URL=https://metabackend-c4e4.onrender.com
```

**⚠️ IMPORTANT**: Custom RPC endpoints are **REQUIRED** for mainnet usage. Public Solana RPC endpoints have strict rate limits and **WILL cause 403 errors** during token operations. See [RPC_CONFIGURATION.md](./RPC_CONFIGURATION.md) for step-by-step setup instructions.

### Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deploying to Vercel

**⚠️ CRITICAL**: If you're deploying to Vercel and using mainnet, you **MUST** configure environment variables in Vercel **BEFORE** or **AFTER** deployment, and then **REDEPLOY**.

Quick steps:
1. Get a free RPC endpoint from [Helius](https://helius.dev) or [QuickNode](https://quicknode.com)
2. In Vercel Dashboard → Project Settings → Environment Variables, add:
   - **Key**: `NEXT_PUBLIC_SOLANA_RPC_MAINNET`
   - **Value**: Your RPC URL (e.g., `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`)
   - **Environment**: Select "Production" (or "All")
3. **REDEPLOY** your application (Vercel → Deployments → Redeploy)
4. Verify in browser console: should see "Using custom mainnet RPC endpoint"

**📖 See [VERCEL_RPC_SETUP.md](./VERCEL_RPC_SETUP.md) for detailed step-by-step instructions with screenshots.**

## Usage

### Creating a New Token

1. Navigate to the home page (`/`)
2. Connect your Solana wallet
3. Fill in token details:
   - Token name
   - Token symbol
   - Description (optional)
   - Upload logo image
   - Set decimals (default: 9)
   - Set initial supply
4. Click "Create Token"
5. Approve the transaction in your wallet
6. Wait for confirmation
7. Your token is now live with metadata on-chain!

**Transaction costs**: ~0.01-0.02 SOL

### Adding Metadata to Existing Tokens

1. Navigate to `/add-metadata`
2. Connect your wallet (must be the mint authority)
3. Enter the token mint address
4. Fill in token details and upload logo
5. Click "Add Metadata"
6. Approve the transaction in your wallet

**Requirements**: You must be the mint authority of the token.

See [ADD_METADATA_GUIDE.md](./ADD_METADATA_GUIDE.md) for detailed instructions.

## Architecture

### Frontend Stack
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Solana Web3.js** - Blockchain interaction
- **Solana Wallet Adapter** - Wallet integration
- **Metaplex UMI** - Token metadata

### Backend
- Separate backend service for IPFS uploads via Pinata
- See [BACKEND_CONFIGURATION.md](./BACKEND_CONFIGURATION.md)

### Smart Contracts
- **SPL Token Program** - Basic token functionality
- **Metaplex Token Metadata Program v3** - On-chain metadata
- **Associated Token Account Program** - Token accounts

## Key Files

- `utils/solana.ts` - Token creation and metadata functions
- `utils/pinata.ts` - IPFS upload functions
- `components/TokenCreator.tsx` - Create new token UI
- `components/AddMetadataToToken.tsx` - Add metadata UI
- `app/page.tsx` - Home page (create token)
- `app/add-metadata/page.tsx` - Add metadata page

## Documentation

- [TROUBLESHOOTING_SOLSCAN.md](./TROUBLESHOOTING_SOLSCAN.md) - **Comprehensive guide** for metadata visibility issues on Solscan
- [RPC_CONFIGURATION.md](./RPC_CONFIGURATION.md) - **Fix 403 errors** with custom RPC setup
- [VERCEL_RPC_SETUP.md](./VERCEL_RPC_SETUP.md) - **Vercel-specific RPC configuration** (for deployments)
- [ADD_METADATA_GUIDE.md](./ADD_METADATA_GUIDE.md) - Guide for adding metadata to existing tokens
- [METADATA_FIX.md](./METADATA_FIX.md) - Technical details about metadata implementation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [BACKEND_CONFIGURATION.md](./BACKEND_CONFIGURATION.md) - Backend setup
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

## Supported Networks

- **Devnet** - For testing (default)
- **Testnet** - For testing
- **Mainnet-beta** - For production tokens

Configure via `NEXT_PUBLIC_SOLANA_NETWORK` environment variable.

## Troubleshooting

### ⚠️ "403 Error" or "Access Forbidden" (MOST COMMON ISSUE)
This is the **most common error** and happens when using public Solana RPC endpoints which are heavily rate-limited. 

**Solution (Required for mainnet):**
1. **Get a FREE RPC endpoint** from:
   - [Helius](https://helius.dev) (Recommended - easy setup, reliable)
   - [QuickNode](https://quicknode.com) 
   - [Alchemy](https://alchemy.com)
2. Create `.env.local` file in project root
3. Add your RPC endpoint:
   ```env
   NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
   ```
4. Restart your development server

**See [RPC_CONFIGURATION.md](./RPC_CONFIGURATION.md) for complete step-by-step instructions.**

The application will show a warning banner when on mainnet without a configured RPC endpoint.

### "Cannot connect to backend"
The backend might be sleeping (Render free tier). Wait 30-60 seconds and try again.

### "Transaction simulation failed"
- Check you have enough SOL for fees
- Verify you're on the correct network
- For adding metadata: ensure you're the mint authority
- The app automatically handles both creating new metadata and updating existing metadata

### Token metadata doesn't show on Solscan
This is a common issue with several possible causes. **See [TROUBLESHOOTING_SOLSCAN.md](./TROUBLESHOOTING_SOLSCAN.md) for a comprehensive troubleshooting guide.**

Quick checklist:
- ⏱️ **Wait 60 seconds** - Solscan needs time to index new metadata
- 🔄 **Refresh the page** - Clear cache or try incognito mode
- ✅ **Verify transaction** - Check console logs for success messages
- 🌐 **Check network** - Ensure you're viewing the correct network (devnet/mainnet)
- 🔍 **Verify on Solana Explorer** - More reliable than Solscan for immediate verification
- 📋 **Check metadata account** - Look for the metadata PDA address in console logs

## Development Workflow

### Dev to Main Sync

This repository includes a GitHub Actions workflow for managing changes between `dev` and `main` branches:

**Manual Trigger:**
1. Go to Actions tab → "Dev to Main Sync"
2. Click "Run workflow"
3. Choose whether to create a PR or direct merge
4. Click "Run workflow" button

**Automatic Trigger:**
- Automatically creates a PR when changes are pushed to `dev` branch

**Features:**
- Creates `dev` branch automatically if it doesn't exist
- Checks for differences between branches
- Option to create PR or direct merge to main
- Skips workflow if branches are in sync

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Links

- [Solscan](https://solscan.io) - Blockchain explorer
- [Solana Explorer](https://explorer.solana.com) - Official explorer
- [Metaplex Docs](https://developers.metaplex.com/token-metadata) - Metadata documentation
- [Solana Token Program](https://spl.solana.com/token) - SPL Token docs

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation files
- Review [Metaplex documentation](https://developers.metaplex.com)

---

Built with ❤️ for the Solana ecosystem
