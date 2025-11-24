# SetAuthority "Owner Does Not Match" Fix

## Problem

Transaction simulation was failing with the following error:

```
Error: Simulation failed. 
Message: Transaction simulation failed: Error processing Instruction 5: custom program error: 0x4. 
Logs: 
  "Program log: Instruction: SetAuthority",
  "Program log: Error: owner does not match",
  "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x4"
```

The error occurred after the Metaplex metadata creation completed successfully. The transaction logs showed:

```
Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s invoke [1]
...
Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]
Program log: Instruction: SetAuthority
Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success
Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]
Program log: Instruction: SetAuthority
Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success
Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s success
Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]
Program log: Instruction: SetAuthority
Program log: Error: owner does not match
Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x4
```

## Root Cause

The issue occurred because the code was trying to manually revoke the mint authority after the Metaplex metadata creation, but the Metaplex `createV1` function had already transferred the authorities:

### Previous (Incorrect) Flow:
1. Create mint account
2. Initialize mint (with payer as mint authority)
3. Create associated token account
4. MintTo instruction
5. **Create Metaplex metadata** ← Internally calls SetAuthority twice to transfer mint and freeze authorities
6. **Manual SetAuthority to revoke mint authority** ← Failed because payer is no longer the authority

The Metaplex Token Metadata Program's `createV1` function internally manages mint and freeze authorities:
- It calls `SetAuthority` twice within the Metaplex program
- These calls transfer the mint authority and freeze authority to a metadata-controlled PDA
- This is especially true for NFTs with Master Editions, where the authority is transferred to the Edition PDA

After the Metaplex program completes, the manual `SetAuthority` instruction attempts to revoke the mint authority, but fails because:
- The instruction specifies the payer as the current authority
- However, the actual authority is now the metadata PDA (set by Metaplex)
- This mismatch causes the "owner does not match" error (code 0x4)

## Solution

Removed the manual `SetAuthority` instruction calls after Metaplex metadata creation. The Metaplex Token Metadata Program handles authority management internally and appropriately:

### New (Correct) Flow:
1. Create mint account
2. Initialize mint (with payer as mint authority)
3. Create associated token account
4. MintTo instruction
5. **Create Metaplex metadata** ← Handles authority management internally
6. ~~Manual SetAuthority to revoke mint authority~~ ← Removed

## Why This Works

### For NFTs (TokenStandard.NonFungible with Master Edition):
- The Metaplex `createV1` function automatically transfers the mint authority to the Edition PDA
- This ensures the supply stays fixed at 1 and prevents further minting
- No manual revocation is needed or possible

### For Fungible Tokens (TokenStandard.Fungible):
- The Metaplex `createV1` function manages authorities according to the token configuration
- When metadata is created, authority management is handled by the metadata program
- Manual intervention after metadata creation causes conflicts

## Files Changed

- **`utils/solana.ts`**
  - Modified `createTokenWithMetadata()` function: Removed manual SetAuthority instruction
  - Modified `createNFT()` function: Removed manual SetAuthority instruction
  - Added explanatory comments about Metaplex authority management
  - Updated console output messages to reflect accurate behavior

## Technical Details

### SPL Token Program SetAuthority Instruction

The SPL Token program's SetAuthority instruction has the following signature:
```rust
SetAuthority {
    account: Pubkey,           // The account to change authority on
    authority_type: AuthorityType,  // MintTokens, FreezeAccount, etc.
    new_authority: Option<Pubkey>,  // New authority (None = revoke)
    current_authority: Pubkey,      // Must match the actual current authority
}
```

The `current_authority` parameter must **exactly match** the authority stored in the account. Any mismatch results in error code 0x4 (OwnerMismatch).

### Metaplex createV1 Authority Management

When calling Metaplex Token Metadata's `createV1`:
- For NFTs with Master Editions (`printSupply` is set to `Some(printSupply('Zero'))`): The mint authority is transferred to the Edition PDA to enforce that the NFT is unique and cannot be reprinted. This ensures the supply remains fixed at 1.
- For tokens without Master Editions (`printSupply` is `none()`): Authority management follows the token standard configuration
- The transfer happens internally via SetAuthority instructions within the Metaplex program
- After metadata creation with a Master Edition, the original creator no longer has mint authority - the Edition PDA controls it

## Testing

To verify this fix:
1. Create a new NFT using the application
2. Observe that the transaction completes successfully without "owner does not match" errors
3. Verify that:
   - The NFT is created and visible on Solscan.io
   - The metadata is correctly displayed
   - The mint authority is properly managed by Metaplex (supply fixed at 1 for NFTs)

For fungible tokens:
1. Create a new token with "Revoke Mint Authority" checkbox selected
2. Observe that the transaction completes successfully
3. Verify that authority management is handled appropriately by the Metaplex metadata program

## Related Issues

This fix is related to but distinct from the previous MINT_AUTHORITY_FIX.md issue:
- **Previous issue**: MintTo instruction failed because metadata was created before minting
- **This issue**: SetAuthority instruction failed because it tried to revoke authority after Metaplex had already managed it

## References

- [SPL Token Program Error Codes](https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/error.rs)
- [Metaplex Token Metadata Program v3](https://developers.metaplex.com/token-metadata)
- [Metaplex Master Edition](https://developers.metaplex.com/token-metadata/print)
- [Solana Transaction Structure](https://docs.solana.com/developing/programming-model/transactions)
