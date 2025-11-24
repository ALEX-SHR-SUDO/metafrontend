# Mint Authority Mismatch Fix

## Problem

Transaction simulation was failing with the following error:

```
Error: Simulation failed. 
Message: Transaction simulation failed: Error processing Instruction 4: custom program error: 0x4. 
Logs: 
  "Program log: Instruction: MintTo",
  "Program log: Error: owner does not match",
  "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x4"
```

Error code `0x4` in the SPL Token program indicates an **owner mismatch** error, specifically that the mint authority provided in the MintTo instruction did not match the actual mint authority on the mint account.

## Root Cause

The transaction instructions were ordered incorrectly:

### Previous (Incorrect) Order:
1. Create mint account
2. Initialize mint (with payer as mint authority)
3. **Create Metaplex metadata** ← Happened too early
4. Create associated token account
5. **MintTo instruction** ← Failed because mint authority didn't match

The Metaplex metadata creation process (step 3) was interfering with the mint authority, causing the subsequent MintTo instruction (step 5) to fail with "owner does not match".

## Solution

Reordered the transaction instructions to ensure minting happens BEFORE metadata creation:

### New (Correct) Order:
1. Create mint account
2. Initialize mint (with payer as mint authority)
3. Create associated token account
4. **MintTo instruction** ← Now succeeds because mint authority is clear
5. **Create Metaplex metadata** ← Happens after minting is complete
6. Revoke mint authority (if requested)

## Why This Works

The MintTo instruction requires that the mint authority specified in the instruction matches the actual mint authority stored in the mint account. By moving the MintTo instruction BEFORE the Metaplex metadata creation:

1. **Authority is unambiguous**: When MintTo executes, the mint authority is clearly set to the payer's wallet address from the InitializeMint instruction
2. **No interference**: The Metaplex metadata program hasn't been involved yet, so there's no possibility of authority confusion
3. **Clean metadata creation**: After tokens are minted, the metadata can be safely added without affecting token supply or authorities

## Files Changed

- **`utils/solana.ts`**
  - Modified `createTokenWithMetadata()` function
  - Modified `createNFT()` function
  - Added explanatory comments for the critical instruction ordering

## Technical Details

The SPL Token program's MintTo instruction has the following signature:
```
MintTo {
    mint: Pubkey,           // The mint account
    destination: Pubkey,    // Token account to receive minted tokens
    authority: Pubkey,      // Must match the mint's mint_authority
    amount: u64,
}
```

The `authority` parameter must exactly match the `mint_authority` field in the mint account. Any mismatch results in error code 0x4 (OwnerMismatch).

## Testing

To verify this fix:
1. Create a new token using the application
2. Observe that the transaction completes successfully
3. Verify that:
   - Tokens are minted to the creator's wallet
   - Metadata is visible on Solscan.io
   - No "owner does not match" errors occur

## References

- [SPL Token Program Error Codes](https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/error.rs)
- [Metaplex Token Metadata Program](https://developers.metaplex.com/token-metadata)
- [Solana Transaction Structure](https://docs.solana.com/developing/programming-model/transactions)
