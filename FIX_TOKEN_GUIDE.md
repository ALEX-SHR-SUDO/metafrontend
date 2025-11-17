# Quick Fix Guide for Token BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o

## Problem
Your token doesn't show a logo and name on Solscan: https://solscan.io/token/BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o?cluster=devnet

## Solution
Use the new "Add Metadata to Existing Token" feature!

## Step-by-Step Instructions

### 1. Navigate to the Add Metadata Page
- Visit your deployed app
- Click on **"Add Metadata to Existing Token"** button at the top
- Or directly go to: `/add-metadata`

### 2. Connect Your Wallet
- Click **"Select Wallet"** button
- Choose your wallet (Phantom, Solflare, etc.)
- **Important**: You must use the wallet that created this token (the mint authority)

### 3. Fill in the Form

**Token Mint Address:**
```
BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o
```

**Token Name:**
- Enter your desired token name (e.g., "My Awesome Token")

**Token Symbol:**
- Enter your desired symbol (e.g., "MAT", max 10 characters)

**Description (Optional):**
- Add a description of your token

**Token Logo:**
- Click "Choose file"
- Upload an image (PNG, JPG, GIF, SVG)
- Recommended: 512x512 pixels or larger

### 4. Submit
- Click **"Add Metadata"** button
- Your wallet will prompt you to approve the transaction
- Make sure you have ~0.01-0.02 SOL for transaction fees
- Wait for the transaction to confirm (usually 5-10 seconds)

### 5. Verify on Solscan
- After success, click the **"View Token on Solscan"** link
- Or visit: https://solscan.io/token/BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o?cluster=devnet
- Refresh the page if needed
- You should now see:
  - ✅ Token Name
  - ✅ Token Symbol
  - ✅ Token Logo
  - ✅ "Token Metadata (Metaplex)" section

## Troubleshooting

### "Invalid mint account or mint does not exist"
- Double-check the mint address is correct
- Make sure you're on the correct network (devnet)

### "Transaction simulation failed"
- Make sure you're using the wallet that created the token (mint authority)
- Check you have enough SOL for transaction fees

### "Cannot connect to backend"
- The backend may be sleeping (Render free tier)
- Wait 30-60 seconds and try again

### Metadata still doesn't show on Solscan
- Wait a few more seconds and refresh
- Solscan takes time to index new metadata
- Verify the transaction succeeded on Solana Explorer

## What if I don't have the mint authority?

If you don't have access to the wallet that created the token, you **cannot** add metadata to it. The Metaplex Token Metadata Program requires the mint authority to create or update metadata for security reasons.

In this case, you would need to:
1. Access the original wallet that created the token, OR
2. Create a new token with metadata from the start

## Need Help?

- Read the full guide: [ADD_METADATA_GUIDE.md](./ADD_METADATA_GUIDE.md)
- Check the README: [README.md](./README.md)
- Review Metaplex docs: https://developers.metaplex.com/token-metadata

---

Good luck! Your token will look great on Solscan! 🚀
