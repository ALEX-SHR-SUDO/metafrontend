# Adding Metadata to Existing Tokens

## Problem

When tokens are created without on-chain metadata (using only the basic SPL Token program), they won't display their name, symbol, or logo on blockchain explorers like Solscan.io. This guide explains how to add metadata to tokens that were already created without it.

## Solution

The application now includes a feature to retroactively add on-chain metadata to existing tokens using the Metaplex Token Metadata Program v3.

## How to Use

### Step 1: Navigate to the Add Metadata Page

Visit the "Add Metadata to Existing Token" page at `/add-metadata` or use the navigation button on the home page.

### Step 2: Connect Your Wallet

Click the "Connect Wallet" button and connect with the wallet that has **mint authority** over the token. This is typically the wallet that originally created the token.

⚠️ **Important**: You must be the mint authority to add metadata. If you're not the mint authority, this operation will fail.

### Step 3: Fill in the Form

1. **Token Mint Address** **(Required)**: Enter the address of the token that needs metadata
   - Example: `BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o`
   - This can be found on Solscan or in your wallet

2. **Token Name** **(Required)**: The name of your token
   - Example: "My Awesome Token"

3. **Token Symbol** **(Required)**: The symbol/ticker for your token
   - Example: "MAT"
   - Maximum 10 characters

4. **Description** (Optional): A description of your token
   - Example: "A token for the future"

5. **Token Logo** **(Required)**: Upload an image file for your token's logo
   - Supported formats: PNG, JPG, GIF, SVG
   - Recommended size: 512x512 pixels or larger
   - The image will be uploaded to IPFS via Pinata

### Step 4: Add Metadata

Click the "Add Metadata" button. The application will:

1. Upload your logo image to IPFS via Pinata
2. Create and upload a metadata JSON file to IPFS
3. Create an on-chain metadata account using Metaplex Token Metadata Program
4. Link the metadata to your existing token

The wallet will prompt you to sign the transaction. Make sure you have enough SOL to pay for transaction fees (typically 0.01-0.02 SOL).

### Step 5: Verify on Solscan

After the transaction is confirmed:

1. Click the "View Token on Solscan" link in the success message
2. Wait a few seconds for Solscan to index the new metadata
3. Refresh the Solscan page if needed
4. You should now see your token's name, symbol, and logo!

## Technical Details

### What Happens Behind the Scenes

The `addMetadataToExistingToken` function:

1. Fetches the token mint account to verify it exists and get decimals
2. Creates a Metaplex metadata account linked to the token mint
3. Stores metadata including:
   - Name and symbol
   - URI pointing to the JSON metadata on IPFS
   - Decimals
   - Token standard (Fungible)
   - Update authority (your wallet)

### Metadata Account Address

The metadata account is a PDA (Program Derived Address) calculated from:
- Metaplex Token Metadata Program ID
- The token mint address
- Seeds: `["metadata", TOKEN_METADATA_PROGRAM_ID, MINT_ADDRESS]`

This ensures a deterministic, unique metadata account for each token.

### Requirements

- You must be the mint authority of the token
- You need SOL for transaction fees
- The application automatically detects if metadata exists and updates it, or creates new metadata if none exists
- The token must be on the same network as configured (devnet/mainnet)

## Network Configuration

The application uses the network configured in the environment variables:
- **Devnet**: For testing (default)
- **Testnet**: For testing
- **Mainnet-beta**: For production tokens

Make sure you're on the correct network before adding metadata.

## Troubleshooting

### "Invalid mint account or mint does not exist"
- Double-check the mint address
- Make sure you're on the correct network (devnet vs mainnet)

### "Signature verification failed" or "Missing signature for public key"
- **This issue has been fixed!** The application now correctly handles signature requirements for existing tokens.
- If you still see this error, make sure you're using the latest version of the application.
- The fix ensures that only the mint authority (your wallet) needs to sign, not the mint account itself.

### "Transaction simulation failed"
- You might not be the mint authority
- You might not have enough SOL for transaction fees
- Check the console logs for detailed error messages

### "Cannot connect to backend"
- The backend might be sleeping (Render free tier takes ~30 seconds to wake up)
- Check your internet connection

### Metadata doesn't show on Solscan
- **Wait and refresh**: Solscan can take 30-60 seconds to index new metadata. Wait a bit and refresh the page.
- **Verify transaction**: Check the transaction on Solana Explorer to confirm it succeeded
- **Check the metadata account**: Look for the "Metadata (Token Metadata)" section on the Solscan token page
- **Verify the network**: Make sure you're viewing the correct network (devnet vs mainnet) on Solscan
- **Clear cache**: Try clearing your browser cache or opening in an incognito/private window
- **Check console logs**: The application logs the metadata account address - you can verify it exists on-chain

### How to Verify Metadata Was Created Successfully

After the transaction confirms, you should see console logs showing:
- ✅ Mint address
- ✅ Metadata account address (PDA)
- ✅ Metadata URI (IPFS link)
- ✅ Update authority
- ✅ Transaction signature

You can manually verify the metadata account exists by:
1. Copying the metadata account address from the console logs
2. Visiting: `https://explorer.solana.com/address/[METADATA_ADDRESS]?cluster=devnet`
3. You should see the metadata account with your token's information

## Example: Fixing Token BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o

To add metadata to the token mentioned in the issue:

1. Go to `/add-metadata`
2. Connect your wallet (must be the mint authority)
3. Enter mint address: `BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o`
4. Enter token name, symbol, and upload a logo
5. Click "Add Metadata"
6. Sign the transaction
7. **IMPORTANT**: After the transaction confirms, check the browser console for:
   - ✅ Metadata account address (save this!)
   - ✅ Metadata URI (IPFS link)
   - ✅ Transaction signature
8. **Wait 30-60 seconds** for Solscan to index the new metadata
9. Visit: https://solscan.io/token/BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o?cluster=devnet
10. Refresh the page if the metadata doesn't appear immediately

Your token should now display with the name, symbol, and logo!

### If Metadata Still Doesn't Appear

1. **Verify the metadata account exists**:
   - Go to Solana Explorer: `https://explorer.solana.com/address/[METADATA_ADDRESS]?cluster=devnet`
   - Replace `[METADATA_ADDRESS]` with the address from console logs
   - You should see the metadata account

2. **Check the IPFS metadata**:
   - Copy the metadata URI from console logs
   - Open it in your browser (e.g., `https://gateway.pinata.cloud/ipfs/...`)
   - Verify the JSON contains name, symbol, and image fields

3. **Contact Solscan**:
   - If the metadata account exists and IPFS JSON is correct, but Solscan still doesn't show it
   - The issue may be with Solscan's indexer
   - Try viewing the token on other explorers like Solana Explorer or Solscan's competitor

## Code Reference

- **Utility Function**: `utils/solana.ts` - `addMetadataToExistingToken()`
- **UI Component**: `components/AddMetadataToToken.tsx`
- **Page Route**: `app/add-metadata/page.tsx`

## Technical Details: Signature Fix (November 2025)

### The Problem
Previously, the `addMetadataToExistingToken` function incorrectly treated the mint account as a signer:

```typescript
// Old (incorrect) code
const mintUmiSigner = createNoopSigner(mintUmiPublicKey);
const createMetadataIx = createV1(umi, {
  mint: mintUmiSigner,  // ❌ Treated mint as a signer
  ...
});
```

This caused the error: `Signature verification failed. Missing signature for public key`.

### The Solution
The fix recognizes that when adding metadata to an **existing** token:
1. The mint account already exists and should be passed as a `PublicKey` (not a `Signer`)
2. The mint authority (wallet) should be explicitly set as the `authority` parameter

```typescript
// New (correct) code
const mintUmiPublicKey = fromWeb3JsPublicKey(mintPublicKey);
const payerUmiSigner = createNoopSigner(payerUmiPublicKey);

const createMetadataIx = createV1(umi, {
  mint: mintUmiPublicKey,      // ✅ Mint as PublicKey (already exists)
  authority: payerUmiSigner,    // ✅ Wallet as authority (will sign)
  ...
});
```

### Why This Matters
- **Creating new tokens**: The mint must be a `Signer` because we're creating the mint account
- **Adding metadata to existing tokens**: The mint should be a `PublicKey` because it already exists

This distinction is crucial for proper transaction signing on Solana.

## Recent Improvements (November 2025)

### Latest Fix: Explicit Update Authority
**Date**: November 18, 2025

The metadata creation process now explicitly sets the `updateAuthority` and `payer` parameters when creating metadata. This ensures:
- Proper metadata account configuration
- Better compatibility with Solscan and other explorers
- Clear ownership and update rights

**What changed:**
- Added explicit `updateAuthority` parameter to `createV1` calls
- Added explicit `payer` parameter to ensure proper account funding
- Enhanced logging to show metadata PDA address and update authority
- Helps verify metadata was created correctly

## Technical Details: Automatic Create/Update Detection (November 2025)

### Enhanced Functionality
The `addMetadataToExistingToken` function now automatically detects whether metadata already exists and handles both scenarios:

#### Metadata Existence Check
```typescript
// Check if metadata already exists
const existingMetadata = await safeFetchMetadataFromSeeds(umi, { mint: mintUmiPublicKey });

if (existingMetadata) {
  // Use updateV1 to update existing metadata
  const updateMetadataIx = updateV1(umi, {
    mint: mintUmiPublicKey,
    authority: payerUmiSigner,
    data: some({
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      // ... other fields
    }),
  });
} else {
  // Use createV1 to create new metadata
  const createMetadataIx = createV1(umi, {
    mint: mintUmiPublicKey,
    authority: payerUmiSigner,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadataUri,
    // ... other fields
  });
}
```

### Why This Matters
- **Tokens without metadata**: The function creates new metadata using `createV1`
- **Tokens with existing metadata**: The function updates the metadata using `updateV1`
- **Error prevention**: Eliminates the "Expected account to be uninitialized" error (0xc7)
- **User experience**: Users don't need to know if their token has metadata or not

This enhancement makes the feature more robust and user-friendly, automatically handling both scenarios without requiring user intervention.

## Related Documentation

- [METADATA_FIX.md](./METADATA_FIX.md) - How metadata works for new tokens
- [Metaplex Token Metadata](https://developers.metaplex.com/token-metadata) - Official documentation
- [Solscan API](https://docs.solscan.io/) - How Solscan reads metadata
