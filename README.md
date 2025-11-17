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

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local`:

```env
# Solana Network (devnet, testnet, or mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Backend API URL for IPFS uploads
NEXT_PUBLIC_BACKEND_URL=https://metabackend-c4e4.onrender.com
```

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

### "Cannot connect to backend"
The backend might be sleeping (Render free tier). Wait 30-60 seconds and try again.

### "Transaction simulation failed"
- Check you have enough SOL for fees
- Verify you're on the correct network
- For adding metadata: ensure you're the mint authority

### Token doesn't show on Solscan
- Wait a few seconds and refresh
- Verify the transaction succeeded on Solana Explorer
- Check you're viewing the correct network (devnet/mainnet)

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
