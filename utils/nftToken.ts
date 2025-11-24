import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  SendTransactionError,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { 
  createUmi 
} from '@metaplex-foundation/umi-bundle-defaults';
import {
  createV1,
  TokenStandard,
  printSupply,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  percentAmount,
  some,
  none,
  createSignerFromKeypair,
  createNoopSigner,
} from '@metaplex-foundation/umi';
import { 
  toWeb3JsInstruction,
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from '@metaplex-foundation/umi-web3js-adapters';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  externalUrl?: string;
  sellerFeeBasisPoints: number;
  attributes?: Array<{ trait_type: string; value: string }>;
  animationUrl?: string;
  properties?: {
    files?: Array<{ uri: string; type: string }>;
    category?: string;
    creators?: Array<{ address: string; share: number }>;
  };
}

/**
 * Create an NFT (Non-Fungible Token) with metadata on Solana
 * NFTs have supply of 1 and 0 decimals
 */
export async function createNFT(
  connection: Connection,
  payer: PublicKey,
  metadata: NFTMetadata,
  metadataUri: string,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    // Create a new mint keypair for the NFT
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;

    console.log('Creating NFT with on-chain metadata using Metaplex...');
    console.log('NFT Mint address:', mintPublicKey.toString());
    console.log('Metadata URI:', metadataUri);

    // Get minimum lamports for rent exemption
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

    // Create transaction
    const transaction = new Transaction({
      feePayer: payer,
      blockhash,
      lastValidBlockHeight,
    });

    // Step 1: Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Step 2: Initialize mint with 0 decimals (NFT standard)
    transaction.add(
      createInitializeMintInstruction(
        mintPublicKey,
        0, // NFTs have 0 decimals
        payer,
        payer, // Keep freeze authority for NFTs
        TOKEN_PROGRAM_ID
      )
    );

    // Step 3: Get associated token account address
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      payer,
      false,
      TOKEN_PROGRAM_ID
    );

    // Step 4: Create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        payer,
        mintPublicKey,
        TOKEN_PROGRAM_ID
      )
    );

    // Step 5: Mint exactly 1 NFT to the associated token account
    // IMPORTANT: This must happen BEFORE creating Metaplex metadata
    // to avoid mint authority mismatch errors
    transaction.add(
      createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        payer,
        1, // NFTs have supply of 1
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Step 6: Create Metaplex metadata using UMI
    // This step is done AFTER minting to avoid authority conflicts.
    // Metaplex will manage the mint authority to ensure NFT supply stays at 1.
    const umi = createUmi(connection.rpcEndpoint);
    
    // Convert the mint keypair to UMI format
    const mintUmiKeypair = fromWeb3JsKeypair(mintKeypair);
    const mintUmiSigner = createSignerFromKeypair(umi, mintUmiKeypair);
    
    // Convert the wallet public key to UMI format and create a noop signer
    const payerUmiPublicKey = fromWeb3JsPublicKey(payer);
    const payerUmiSigner = createNoopSigner(payerUmiPublicKey);
    
    // Set the signer identity on the UMI instance
    umi.use({
      install(umi) {
        umi.identity = payerUmiSigner;
        umi.payer = payerUmiSigner;
      }
    });

    // Build the createV1 instruction for NFT metadata
    const createMetadataIx = createV1(umi, {
      mint: mintUmiSigner,
      authority: payerUmiSigner,
      updateAuthority: payerUmiPublicKey,
      payer: payerUmiSigner,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(metadata.sellerFeeBasisPoints / 100), // Convert basis points (0-10000) to percentage (0-100)
      decimals: some(0), // NFTs have 0 decimals
      tokenStandard: TokenStandard.NonFungible, // NFT standard (not Fungible)
      collectionDetails: none(),
      creators: none(),
      printSupply: some(printSupply('Zero')), // NFTs require explicit print supply
      isMutable: true,
      primarySaleHappened: false,
    });

    // Get the instruction from the builder and convert to web3.js
    const metadataInstructions = createMetadataIx.getInstructions();
    
    // Convert each UMI instruction to web3.js instruction
    for (const ix of metadataInstructions) {
      const web3Ix = toWeb3JsInstruction(ix);
      transaction.add(web3Ix);
    }

    // Note: Metaplex Token Metadata program automatically manages mint authority
    // when creating NFT metadata. The mint authority is transferred to the metadata
    // program, ensuring the supply stays at 1 for NFTs. No additional SetAuthority
    // instruction is needed.

    // Partially sign with mint keypair
    transaction.partialSign(mintKeypair);

    console.log('Transaction prepared. Requesting wallet signature...');

    // Sign with wallet
    const signedTransaction = await signTransaction(transaction);

    console.log('Sending transaction...');

    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('Transaction sent. Signature:', signature);
    console.log('Confirming transaction...');

    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    console.log('✅ NFT created successfully!');
    console.log('✅ NFT Mint address:', mintPublicKey.toString());
    console.log('✅ On-chain metadata created via Metaplex Token Metadata Program');
    console.log('✅ Metadata URI:', metadataUri);
    console.log('✅ NFT should now be visible on Solscan.io and Solana Explorer');
    console.log('✅ Mint authority managed by Metaplex - supply is fixed at 1');
    console.log('Transaction signature:', signature);

    return mintPublicKey.toString();
  } catch (error) {
    console.error('Error creating NFT:', error);
    
    // Check if this is a 403 error from RPC endpoint
    if (error instanceof Error && (error.message.includes('403') || error.message.includes('Access forbidden'))) {
      const rpcError = new Error(
        '❌ RPC Error 403: Access Forbidden\n\n' +
        'The Solana RPC endpoint is rate-limiting your requests. This usually happens when using the public RPC endpoint without a custom configuration.\n\n' +
        '🔧 How to fix:\n' +
        '1. Get a free RPC API key from Helius (https://helius.dev) or QuickNode (https://quicknode.com)\n' +
        '2. Create a .env.local file in your project root\n' +
        '3. Add: NEXT_PUBLIC_SOLANA_RPC_MAINNET=your_rpc_url\n' +
        '4. Restart your application\n\n' +
        'See the RPC Configuration Guide for detailed instructions:\n' +
        'https://github.com/ALEX-SHR-SUDO/metafrontend/blob/main/RPC_CONFIGURATION.md'
      );
      throw rpcError;
    }
    
    // If this is a SendTransactionError, get detailed logs
    if (error instanceof SendTransactionError) {
      console.error('Transaction simulation failed. Getting detailed logs...');
      
      let logs = error.logs;
      
      if (!logs || logs.length === 0) {
        try {
          logs = await error.getLogs(connection);
        } catch (logError) {
          console.error('Failed to retrieve transaction logs:', logError);
        }
      }
      
      console.error('Transaction logs:', logs);
      
      const logString = logs && logs.length > 0 ? logs.join('\n') : 'No logs available';
      const detailedError = new Error(
        `Transaction simulation failed.\n\nError: ${error.message}\n\nTransaction Logs:\n${logString}`
      );
      throw detailedError;
    }
    
    throw error;
  }
}
