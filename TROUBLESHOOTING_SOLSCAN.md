# Troubleshooting: Token Metadata Not Showing on Solscan

## Issue: Created Token But Metadata Doesn't Appear on Solscan

If you've created a token using this application but the metadata (name, symbol, logo) is not showing on Solscan, follow this comprehensive troubleshooting guide.

### Quick Checklist

Before diving deep, check these common issues:

- [ ] **Wait Time**: Have you waited at least 60 seconds? Solscan needs time to index new metadata.
- [ ] **Correct Network**: Are you viewing the correct network on Solscan (devnet vs mainnet)?
- [ ] **Browser Cache**: Have you tried clearing cache or using an incognito/private window?
- [ ] **Transaction Success**: Did the transaction actually succeed? Check the console logs.

## Step-by-Step Troubleshooting

### Step 1: Verify Transaction Success

After creating your token, check the browser console (F12) for these messages:

```
✅ Token created successfully!
✅ Mint address: [YOUR_TOKEN_ADDRESS]
✅ Metadata account address: [METADATA_PDA_ADDRESS]
✅ On-chain metadata created via Metaplex Token Metadata Program
✅ Metadata URI: [IPFS_URI]
✅ Update authority: [YOUR_WALLET_ADDRESS]
✅ Transaction signature: [TX_SIGNATURE]
```

If you see these messages, your token and metadata were created successfully.

### Step 2: Verify Metadata Account Exists

1. Copy the **Metadata account address** from the console logs
2. Visit the Solana Explorer:
   - Devnet: `https://explorer.solana.com/address/[METADATA_ADDRESS]?cluster=devnet`
   - Mainnet: `https://explorer.solana.com/address/[METADATA_ADDRESS]?cluster=mainnet-beta`
3. You should see:
   - Account Type: "Metadata" or "Token Metadata"
   - Owner: Metaplex Token Metadata Program
   - Your token's name, symbol, and URI

**If the metadata account doesn't exist:**
- The transaction may have failed
- Check the transaction signature on Solana Explorer
- Review the error logs in the browser console
- You may need to try creating the token again

**If the metadata account exists:**
- Your metadata is on-chain! ✅
- Continue to Step 3

### Step 3: Verify IPFS Metadata

1. Copy the **Metadata URI** from the console logs (should be an IPFS link)
2. Open the URI in your browser
3. You should see a JSON file with:
   ```json
   {
     "name": "Your Token Name",
     "symbol": "SYMBOL",
     "description": "Your description",
     "image": "ipfs://...",
     "properties": {...}
   }
   ```

**If the IPFS metadata is missing or incorrect:**
- The upload to IPFS may have failed
- Try creating the token again
- Check that your backend is working (NEXT_PUBLIC_BACKEND_URL)

**If the IPFS metadata looks correct:**
- Your metadata is properly stored! ✅
- Continue to Step 4

### Step 4: Wait for Solscan Indexing

Solscan's indexer needs time to discover and display new metadata:

- **Typical wait time**: 30-60 seconds
- **Maximum wait time**: Up to 2-3 minutes for devnet
- **For mainnet**: Usually faster (15-30 seconds)

**What to do:**
1. Wait the full 60 seconds after transaction confirmation
2. Refresh the Solscan page
3. Clear your browser cache if needed
4. Try opening in an incognito/private window

### Step 5: Verify on Multiple Explorers

If Solscan still doesn't show your metadata, try these alternatives:

1. **Solana Explorer**: 
   - `https://explorer.solana.com/address/[TOKEN_ADDRESS]?cluster=devnet`
   - Should show "Token Metadata" section with your name and symbol

2. **SolanaFM**: 
   - `https://solana.fm/address/[TOKEN_ADDRESS]?cluster=devnet-solana`
   - Alternative explorer that may show metadata

3. **Your Wallet**:
   - Open your Solana wallet (Phantom, Solflare, etc.)
   - Check if the token shows with correct name and logo

**If metadata shows on other explorers but not Solscan:**
- This is a Solscan indexing issue
- Your metadata is correct and on-chain
- Solscan will eventually catch up (may take hours for devnet)

### Step 6: Check Network Configuration

Ensure you're viewing the correct network:

1. **On Solscan**: Look for the network selector (usually top-right)
2. **Verify it matches**: devnet, testnet, or mainnet-beta
3. **Common mistake**: Creating token on devnet but viewing mainnet Solscan

**Quick check:**
- Devnet URL: `https://solscan.io/token/[ADDRESS]?cluster=devnet`
- Mainnet URL: `https://solscan.io/token/[ADDRESS]`

## Common Issues and Solutions

### Issue: "Metadata still doesn't show after 5+ minutes"

**Possible causes:**
1. **Devnet is slower**: Devnet indexing can be much slower than mainnet
2. **Solscan cache**: Their cache might be stale

**Solutions:**
- Check on Solana Explorer first (more reliable)
- Try accessing from a different device/browser
- For important tokens, use mainnet instead of devnet

### Issue: "Metadata shows partially (name but no logo)"

**This is actually good progress!** It means:
- Solscan found your metadata ✅
- The IPFS image might be loading slowly
- Image URL might have an issue

**Solutions:**
1. Check the image field in your IPFS metadata JSON
2. Verify the image URL is accessible
3. Wait a bit longer - images load after text metadata
4. Consider re-uploading with a different image format

### Issue: "Token shows 'Unknown' on Solscan"

**This means:**
- Solscan hasn't indexed the metadata yet
- Or there's no metadata account

**Solutions:**
1. Complete Step 2 above to verify metadata account exists
2. If it doesn't exist, you need to add metadata
3. If it does exist, wait longer for Solscan indexing

## For Existing Tokens Without Metadata

If you created your token **before** this application properly added metadata, or if you created it using another tool:

1. **Use the "Add Metadata" feature**:
   - Navigate to `/add-metadata` in this application
   - You must be the mint authority
   - Follow the guide: [ADD_METADATA_GUIDE.md](./ADD_METADATA_GUIDE.md)

2. **Verify you have mint authority**:
   ```bash
   # Check on Solana Explorer
   https://explorer.solana.com/address/[TOKEN_ADDRESS]?cluster=devnet
   # Look for "Mint Authority" field
   ```

## Technical Details

### How Metadata Works

1. **Token Mint**: The basic SPL token (created first)
2. **Metadata Account**: A PDA (Program Derived Address) linked to the mint
3. **IPFS Storage**: JSON metadata with name, symbol, description, image
4. **Metaplex Program**: Token Metadata Program that creates the metadata account

### Metadata PDA Calculation

The metadata account address is deterministically calculated:
```
PDA = findProgramAddress([
  "metadata",
  TOKEN_METADATA_PROGRAM_ID,
  MINT_ADDRESS
])
```

This means:
- Every token has a unique, predictable metadata account address
- You can verify the metadata account exists by checking this address
- The metadata is permanently linked to your token

### What Solscan Needs to See

For Solscan to display your token properly:

1. ✅ Metadata account must exist on-chain
2. ✅ Metadata account must be owned by Metaplex Token Metadata Program
3. ✅ Metadata URI must be accessible (IPFS)
4. ✅ Metadata JSON must have required fields (name, symbol, image)
5. ✅ Update authority must be properly set
6. ✅ Token standard must be set (Fungible)

This application ensures all of these are properly configured.

## Getting Help

If you've followed all steps and still have issues:

1. **Check the documentation**:
   - [README.md](./README.md) - General documentation
   - [ADD_METADATA_GUIDE.md](./ADD_METADATA_GUIDE.md) - Adding metadata guide
   - [SOLSCAN_VISIBILITY_FIX.md](./SOLSCAN_VISIBILITY_FIX.md) - Recent fixes

2. **Save your information**:
   - Token mint address
   - Metadata account address
   - Transaction signature
   - IPFS metadata URI
   - Console logs (take a screenshot)

3. **Open an issue on GitHub**:
   - Include all the information from step 2
   - Specify which network (devnet/mainnet)
   - Describe what you've tried

4. **Contact Solscan support**:
   - If metadata works on other explorers but not Solscan
   - This indicates a Solscan-specific indexing issue
   - Provide them with your token address and network

## Prevention: Best Practices

To avoid metadata issues in the future:

1. **Use this application** to create tokens (it handles metadata correctly)
2. **Test on devnet first** before creating on mainnet
3. **Save all information** from console logs after creation
4. **Verify immediately** on Solana Explorer (more reliable than Solscan)
5. **Be patient** - allow 60+ seconds for indexing
6. **Use mainnet** for production tokens (better indexing performance)

## Summary

Most "metadata not showing" issues are simply:
1. **Not waiting long enough** (wait 60+ seconds)
2. **Wrong network** (viewing mainnet when token is on devnet)
3. **Browser cache** (try incognito mode)

If you've verified:
- ✅ Metadata account exists on Solana Explorer
- ✅ IPFS JSON is correct and accessible
- ✅ Waited 2+ minutes
- ✅ Viewing correct network

Then your token is correctly configured! Solscan will eventually index it. In the meantime, your token is fully functional and the metadata works on other explorers and in wallets.

---

**Last Updated**: November 2025  
**Application Version**: 1.0.0  
**Metaplex Version**: v3.4.0
