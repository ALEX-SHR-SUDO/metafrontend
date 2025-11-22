# Quick Setup Guide

This guide will help you get started with Solana Token Creator in 5 minutes.

## 🚀 Quick Start (3 Steps)

### 1. Clone and Install

```bash
git clone https://github.com/ALEX-SHR-SUDO/metafrontend.git
cd metafrontend
npm install
```

After installation, you'll see a welcome message reminding you to configure your environment.

### 2. Configure Environment

**Option A: Interactive Setup (Recommended)**
```bash
npm run setup
```

This will guide you through:
- Choosing your network (devnet for testing, mainnet for production)
- Configuring RPC endpoints (required for mainnet)
- Setting up backend URL

**Option B: Manual Setup**
```bash
cp .env.example .env.local
# Edit .env.local with your preferred editor
```

### 3. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚠️ Understanding the RPC Warning

If you run the app on mainnet without configuring a custom RPC endpoint, you'll see this warning:

```
⚠️ No custom RPC endpoint configured for mainnet! 
Public endpoints have strict rate limits and may return 403 errors.
Set NEXT_PUBLIC_SOLANA_RPC_MAINNET in .env.local.
Get a free endpoint from: https://helius.dev or https://quicknode.com
```

**This is by design!** The warning alerts you to configure a proper RPC endpoint before using mainnet.

### Why You Need a Custom RPC for Mainnet

**Public Solana RPC endpoints:**
- ❌ Heavily rate-limited
- ❌ Shared by thousands of users
- ❌ Will return 403 errors under load
- ✅ OK for devnet testing

**Custom RPC endpoints:**
- ✅ Higher rate limits
- ✅ Reliable and fast
- ✅ Free tiers available
- ✅ Required for mainnet production

## 🔧 Getting Your Free RPC Endpoint

### Option 1: Helius (Recommended)

1. Visit [https://helius.dev](https://helius.dev)
2. Sign up for a free account
3. Create a new project
4. Copy your RPC endpoint URLs:
   - Mainnet: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
   - Devnet: `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`

### Option 2: QuickNode

1. Visit [https://quicknode.com](https://quicknode.com)
2. Sign up for a free account
3. Create a Solana endpoint
4. Copy your RPC URL

### Option 3: Alchemy

1. Visit [https://alchemy.com](https://alchemy.com)
2. Sign up for a free account
3. Create a Solana app
4. Copy your RPC URL

## 📝 Configuration Examples

### For Development (Devnet)

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_BACKEND_URL=https://metabackend-c4e4.onrender.com
```

No custom RPC needed - public endpoints work fine for devnet.

### For Production (Mainnet)

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_BACKEND_URL=https://metabackend-c4e4.onrender.com
```

Custom RPC is **REQUIRED** to avoid 403 errors.

## 🎯 What Each Script Does

### `npm run setup`
Interactive wizard that creates your `.env.local` file with all the necessary configuration.

### `npm run dev`
Starts the development server at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Creates an optimized production build

### `npm start`
Runs the production build

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `.env.local` file exists in your project root
- [ ] `NEXT_PUBLIC_SOLANA_NETWORK` is set (devnet or mainnet-beta)
- [ ] If using mainnet: `NEXT_PUBLIC_SOLANA_RPC_MAINNET` is configured
- [ ] `npm run dev` starts without errors
- [ ] You can access the app at http://localhost:3000
- [ ] No warning banner appears (or dismissed if using devnet)

## 🐛 Troubleshooting

### "I still see the RPC warning"

**Cause:** You're on mainnet without a custom RPC endpoint.

**Solution:** 
1. Run `npm run setup` and choose mainnet
2. Enter your RPC endpoint URL
3. Restart your dev server

### "Where do I get an RPC endpoint?"

See the [Getting Your Free RPC Endpoint](#-getting-your-free-rpc-endpoint) section above. Helius is the easiest option.

### "Can I use devnet without an RPC endpoint?"

Yes! Devnet works fine with public endpoints. The warning only appears for mainnet.

### "I don't want to switch to mainnet yet"

Perfect! Just use devnet for development. The default configuration uses devnet, which doesn't require a custom RPC endpoint.

### "The setup script isn't working"

Try the manual setup instead:
```bash
cp .env.example .env.local
nano .env.local  # or use your preferred editor
```

## 📚 Additional Resources

- [RPC_CONFIGURATION.md](./RPC_CONFIGURATION.md) - Detailed RPC setup guide
- [QUICK_START.md](./QUICK_START.md) - Quick start for deployment
- [README.md](./README.md) - Full project documentation
- [scripts/README.md](./scripts/README.md) - Script documentation

## 🎉 You're All Set!

Once configured, you can:
- Create new SPL tokens with metadata
- Add metadata to existing tokens
- Upload logos to IPFS
- View your tokens on Solscan and Solana Explorer

Need help? Check the documentation or open an issue on GitHub.

---

**Happy Building! 🚀**
