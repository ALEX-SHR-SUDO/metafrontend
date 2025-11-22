# Guide: Why My New Token Doesn't Show Metadata on Solscan

## Issue Description

You created a new token using this application, but when you check Solscan, the metadata (name, symbol, logo) is not showing. The token appears as "Unknown" or without its details.

**Example**: Token `62bgoscCCS8dRpZqWJhzJUjoH8qJBkvwqtFAdPXgPk8C` on devnet doesn't show metadata.

## Understanding the Issue

This is usually **NOT a problem with your token**! It's typically due to:

1. ⏱️ **Indexing delay** - Solscan needs time to discover and index new metadata
2. 🔄 **Cache** - Your browser or Solscan's servers may be showing cached data
3. 🌐 **Network** - You might be viewing the wrong network (devnet vs mainnet)

## Quick Solution: Verify Your Token Was Created Correctly

### Step 1: Check Your Browser Console

After creating your token, open the browser console (press `F12` or right-click → Inspect → Console). Look for these success messages:

```
✅ Token created successfully!
✅ Mint address: [YOUR_TOKEN_ADDRESS]
✅ Metadata account address: [METADATA_PDA_ADDRESS]
✅ On-chain metadata created via Metaplex Token Metadata Program
✅ Metadata URI: [IPFS_URI]
✅ Update authority: [YOUR_WALLET_ADDRESS]
✅ Metadata should now be visible on Solscan.io (wait 30-60 seconds for indexing)
✅ Transaction signature: [TX_SIGNATURE]

📋 Verification URLs:
   Metadata Account: https://explorer.solana.com/address/[METADATA_ADDRESS]?cluster=devnet
   Token on Solscan: https://solscan.io/token/[TOKEN_ADDRESS]?cluster=devnet
   Metadata JSON: https://gateway.pinata.cloud/ipfs/[IPFS_HASH]
```

**If you see these messages**: Your token was created successfully with metadata! ✅

### Step 2: Verify on Solana Explorer

Click the "Metadata Account" link from the console logs, or visit:
```
https://explorer.solana.com/address/[METADATA_ADDRESS]?cluster=devnet
```

You should see:
- Account owner: Token Metadata Program (metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s)
- Your token's name, symbol, and URI

**If you see this**: Your metadata is on-chain! ✅ Continue to Step 3.

**If the account doesn't exist**: Something went wrong. See the "Troubleshooting" section below.

### Step 3: Verify IPFS Metadata

Click the "Metadata JSON" link from the console logs, or open the IPFS URI in your browser.

You should see JSON like this:
```json
{
  "name": "Your Token Name",
  "symbol": "SYMBOL",
  "description": "Your token description",
  "image": "ipfs://...",
  "properties": {
    "files": [...]
  }
}
```

**If you see this**: Your metadata is properly stored on IPFS! ✅

### Step 4: Wait for Solscan to Index

This is the most common reason for "missing" metadata:

- **Devnet**: Can take 30 seconds to 2-3 minutes
- **Mainnet**: Usually 15-60 seconds
- **Peak times**: May take longer

**What to do:**
1. ⏱️ Wait at least 60 seconds
2. 🔄 Refresh the Solscan page (press F5)
3. 🧹 Clear your browser cache or try incognito mode
4. 🌐 Verify you're viewing the correct network on Solscan

### Step 5: Check Alternative Explorers

If Solscan still doesn't show your metadata after 2+ minutes:

**Solana Explorer** (most reliable):
```
https://explorer.solana.com/address/[TOKEN_ADDRESS]?cluster=devnet
```
Look for the "Token Metadata" section.

**SolanaFM**:
```
https://solana.fm/address/[TOKEN_ADDRESS]?cluster=devnet-solana
```

**Your Wallet**:
- Open your Solana wallet (Phantom, Solflare, etc.)
- Check if the token shows with correct name and logo

**If metadata shows on other explorers**: Your token is fine! Solscan will eventually catch up. This is a Solscan indexing delay, not a problem with your token.

## Common Questions

### Q: How long should I wait?

**A**: For devnet, wait at least 60 seconds, up to 3 minutes. For mainnet, usually 15-60 seconds.

### Q: It's been 5+ minutes and still no metadata on Solscan

**A**: 
1. First, verify on Solana Explorer (more reliable)
2. If it shows there, your token is fine
3. Solscan's devnet indexer can be slow during peak times
4. For production tokens, use mainnet (better indexing)

### Q: Should I try to add metadata again?

**A**: NO! If the console logs showed success and the metadata account exists on Solana Explorer, your metadata is there. Adding it again might cause conflicts.

### Q: What if I didn't see the success messages in console?

**A**: The transaction might have failed. Check the transaction signature on Solana Explorer. If it failed, you can try creating the token again.

### Q: Can I check if metadata exists without console logs?

**A**: Yes! Calculate the metadata PDA:
1. Go to Solana Explorer
2. Enter your token mint address
3. Look for "Metadata" in the account details
4. Or manually check the metadata PDA address (see technical details below)

## If Metadata Is Actually Missing

If you've verified that:
- ❌ The metadata account doesn't exist on Solana Explorer
- ❌ The transaction failed or shows errors
- ❌ No IPFS metadata exists

Then you can **add metadata to your existing token**:

1. Go to `/add-metadata` in this application
2. Enter your token mint address
3. Fill in the metadata details
4. Upload a logo
5. Submit the transaction

**See**: [ADD_METADATA_GUIDE.md](./ADD_METADATA_GUIDE.md) for detailed instructions.

## Technical Details

### How Token Metadata Works

When you create a token with this application:

1. **Token Mint**: Basic SPL token is created
2. **Metadata Upload**: Logo and metadata JSON uploaded to IPFS
3. **Metadata Account**: On-chain PDA created by Metaplex Token Metadata Program
4. **Linking**: Metadata account is linked to your token mint

### Metadata PDA (Program Derived Address)

The metadata account address is deterministically calculated:
```
seeds = ["metadata", TOKEN_METADATA_PROGRAM_ID, TOKEN_MINT_ADDRESS]
PDA = findProgramAddress(seeds, TOKEN_METADATA_PROGRAM_ID)
```

This address is what Solscan queries to get your token's metadata.

### Why Solscan Might Be Slow

Solscan uses an indexer that:
1. Monitors new transactions on Solana
2. Identifies new metadata accounts
3. Fetches and caches the metadata
4. Updates its database

During peak usage or on devnet, this process can be delayed.

### What Solscan Needs

For Solscan to display your token:
1. ✅ Metadata account must exist on-chain
2. ✅ Owned by Metaplex Token Metadata Program
3. ✅ Valid metadata URI pointing to IPFS
4. ✅ IPFS JSON must be accessible
5. ✅ Proper authorities set (authority, updateAuthority)

This application ensures all of these are correct.

## Prevention Tips

For future token creations:

1. ✅ **Always check console logs** immediately after creation
2. ✅ **Save the information** (mint address, metadata PDA, transaction signature)
3. ✅ **Verify on Solana Explorer first** before checking Solscan
4. ✅ **Be patient** - allow time for indexing
5. ✅ **Use mainnet for production** - better indexing performance

## Need More Help?

**Comprehensive troubleshooting**: [TROUBLESHOOTING_SOLSCAN.md](./TROUBLESHOOTING_SOLSCAN.md)

**Adding metadata to existing tokens**: [ADD_METADATA_GUIDE.md](./ADD_METADATA_GUIDE.md)

**General documentation**: [README.md](./README.md)

**Technical details**: [METADATA_FIX.md](./METADATA_FIX.md)

## Summary

In 95% of cases, if you see the success messages in the console:
1. ✅ Your token is correct
2. ✅ Metadata is on-chain
3. ✅ Just wait for Solscan to index it

**Don't panic!** Your token is fine. Solscan will catch up. In the meantime, verify on Solana Explorer and your wallet.

---

**Last Updated**: November 2025  
**Application Version**: 1.0.0  
**Issue**: Token metadata visibility on Solscan
