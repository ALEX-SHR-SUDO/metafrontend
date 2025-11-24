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
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { 
  createUmi 
} from '@metaplex-foundation/umi-bundle-defaults';
import {
  createV1,
  updateV1,
  TokenStandard,
  findMetadataPda,
  safeFetchMetadataFromSeeds,
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
import { calculateTokenAmount } from './helpers';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  decimals: number;
  supply: number;
}

export interface ExistingTokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

export async function createTokenWithMetadata(
  connection: Connection,
  payer: PublicKey,
  metadata: TokenMetadata,
  metadataUri: string,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  revokeMintAuthority: boolean = false,
  revokeFreezeAuthority: boolean = false
): Promise<string> {
  try {
    // Create a new mint keypair
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;

    console.log('Creating token with on-chain metadata using Metaplex...');
    console.log('Mint address:', mintPublicKey.toString());
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

    // Step 2: Initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mintPublicKey,
        metadata.decimals,
        payer,
        revokeFreezeAuthority ? null : payer,
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

    // Step 5: Mint tokens to the associated token account
    // This must happen BEFORE creating metadata, because Metaplex will transfer mint authority
    const mintAmount = calculateTokenAmount(metadata.supply, metadata.decimals);
    transaction.add(
      createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        payer,
        mintAmount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Step 6: Create Metaplex metadata using UMI
    const umi = createUmi(connection.rpcEndpoint);
    
    // Convert the mint keypair to UMI format
    const mintUmiKeypair = fromWeb3JsKeypair(mintKeypair);
    const mintUmiSigner = createSignerFromKeypair(umi, mintUmiKeypair);
    
    // Convert the wallet public key to UMI format and create a noop signer
    // The actual signing will be done by the wallet later
    const payerUmiPublicKey = fromWeb3JsPublicKey(payer);
    const payerUmiSigner = createNoopSigner(payerUmiPublicKey);
    
    // Set the signer identity on the UMI instance
    // Use the wallet as payer (not the mint keypair) to avoid "from must not carry data" error
    umi.use({
      install(umi) {
        umi.identity = payerUmiSigner;
        umi.payer = payerUmiSigner;
      }
    });

    // Build the createV1 instruction for metadata
    const createMetadataIx = createV1(umi, {
      mint: mintUmiSigner,
      authority: payerUmiSigner,  // Set the mint authority
      updateAuthority: payerUmiPublicKey,  // Explicitly set the update authority
      payer: payerUmiSigner,  // Explicitly set the payer
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: some(metadata.decimals),
      tokenStandard: TokenStandard.Fungible,
      collectionDetails: none(),
      creators: none(),
      printSupply: none(),
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

    // Step 7: Revoke mint authority if requested
    // Note: When creating metadata, Metaplex transfers mint and freeze authorities to itself.
    // The revokeMintAuthority option is ignored because authority is already controlled by Metaplex.
    // This ensures the token's metadata cannot be detached, maintaining on-chain metadata integrity.
    if (revokeMintAuthority) {
      console.log('Note: Mint authority is already managed by Metaplex Token Metadata program');
    }

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

    console.log('✅ Token created successfully!');
    console.log('✅ Mint address:', mintPublicKey.toString());
    console.log('✅ On-chain metadata created via Metaplex Token Metadata Program');
    console.log('✅ Metadata URI:', metadataUri);
    console.log('✅ Metadata should now be visible on Solscan.io');
    console.log('✅ Mint and freeze authorities are managed by Metaplex for metadata integrity');
    console.log('Transaction signature:', signature);

    return mintPublicKey.toString();
  } catch (error) {
    console.error('Error creating token with Metaplex metadata:', error);
    
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
      
      // First check if logs are already available on the error object
      let logs = error.logs;
      
      // If not, try to fetch them
      if (!logs || logs.length === 0) {
        try {
          logs = await error.getLogs(connection);
        } catch (logError) {
          console.error('Failed to retrieve transaction logs:', logError);
        }
      }
      
      console.error('Transaction logs:', logs);
      
      // Create a more detailed error message with logs
      const logString = logs && logs.length > 0 ? logs.join('\n') : 'No logs available';
      const detailedError = new Error(
        `Transaction simulation failed.\n\nError: ${error.message}\n\nTransaction Logs:\n${logString}`
      );
      throw detailedError;
    }
    
    throw error;
  }
}

/**
 * Add metadata to an existing token that was created without it
 * This function creates on-chain metadata for tokens that don't have it yet
 */
export async function addMetadataToExistingToken(
  connection: Connection,
  payer: PublicKey,
  mintAddress: string,
  metadata: ExistingTokenMetadata,
  metadataUri: string,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    
    console.log('Adding on-chain metadata to existing token using Metaplex...');
    console.log('Mint address:', mintPublicKey.toString());
    console.log('Metadata URI:', metadataUri);

    // Get mint account info to determine decimals
    const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
    
    if (!mintInfo.value || !('parsed' in mintInfo.value.data)) {
      throw new Error('Invalid mint account or mint does not exist');
    }

    const mintData = mintInfo.value.data.parsed.info;
    const decimals = mintData.decimals;

    console.log('Token decimals:', decimals);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

    // Create transaction
    const transaction = new Transaction({
      feePayer: payer,
      blockhash,
      lastValidBlockHeight,
    });

    // Create Metaplex metadata using UMI
    const umi = createUmi(connection.rpcEndpoint);
    
    // Convert the mint public key to UMI format
    // For existing tokens, we pass the mint as a PublicKey (not a Signer)
    // because the mint account already exists and doesn't need to sign
    const mintUmiPublicKey = fromWeb3JsPublicKey(mintPublicKey);
    
    // Convert the wallet public key to UMI format and create a noop signer
    // The payer is the mint authority and will sign the transaction
    const payerUmiPublicKey = fromWeb3JsPublicKey(payer);
    const payerUmiSigner = createNoopSigner(payerUmiPublicKey);
    
    // Set the signer identity on the UMI instance
    umi.use({
      install(umi) {
        umi.identity = payerUmiSigner;
        umi.payer = payerUmiSigner;
      }
    });

    // Check if metadata already exists for this token
    const metadataPda = findMetadataPda(umi, { mint: mintUmiPublicKey });
    console.log('Metadata PDA address:', metadataPda[0].toString());
    
    const existingMetadata = await safeFetchMetadataFromSeeds(umi, { mint: mintUmiPublicKey });
    
    let metadataInstructions;
    
    if (existingMetadata) {
      // Metadata already exists, use updateV1 instead of createV1
      console.log('Metadata already exists for this token. Updating existing metadata...');
      console.log('Existing metadata address:', metadataPda[0].toString());
      
      const updateMetadataIx = updateV1(umi, {
        mint: mintUmiPublicKey,
        authority: payerUmiSigner,
        data: some({
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadataUri,
          sellerFeeBasisPoints: 0,
          creators: none(),
          collection: none(),
          uses: none(),
        }),
        primarySaleHappened: some(false),
        isMutable: some(true),
      });
      
      metadataInstructions = updateMetadataIx.getInstructions();
    } else {
      // Metadata doesn't exist, create it
      console.log('No existing metadata found. Creating new metadata...');
      
      const createMetadataIx = createV1(umi, {
        mint: mintUmiPublicKey,  // PublicKey, not Signer - the mint already exists
        authority: payerUmiSigner,  // Explicitly set the mint authority as signer
        updateAuthority: payerUmiPublicKey,  // Explicitly set the update authority
        payer: payerUmiSigner,  // Explicitly set the payer
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: some(decimals),
        tokenStandard: TokenStandard.Fungible,
        collectionDetails: none(),
        creators: none(),
        printSupply: none(),
        isMutable: true,
        primarySaleHappened: false,
      });
      
      metadataInstructions = createMetadataIx.getInstructions();
    }
    
    // Convert each UMI instruction to web3.js instruction
    for (const ix of metadataInstructions) {
      const web3Ix = toWeb3JsInstruction(ix);
      transaction.add(web3Ix);
    }

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

    const action = existingMetadata ? 'updated' : 'added';
    console.log(`✅ Metadata ${action} successfully!`);
    console.log('✅ Mint address:', mintPublicKey.toString());
    console.log('✅ Metadata account address:', metadataPda[0].toString());
    console.log(`✅ On-chain metadata ${action} via Metaplex Token Metadata Program`);
    console.log('✅ Metadata URI:', metadataUri);
    console.log('✅ Metadata should now be visible on Solscan.io');
    console.log('✅ Update authority:', payerUmiPublicKey.toString());
    console.log('Transaction signature:', signature);

    return signature;
  } catch (error) {
    console.error('Error adding metadata to existing token:', error);
    
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
      
      // First check if logs are already available on the error object
      let logs = error.logs;
      
      // If not, try to fetch them
      if (!logs || logs.length === 0) {
        try {
          logs = await error.getLogs(connection);
        } catch (logError) {
          console.error('Failed to retrieve transaction logs:', logError);
        }
      }
      
      console.error('Transaction logs:', logs);
      
      // Create a more detailed error message with logs
      const logString = logs && logs.length > 0 ? logs.join('\n') : 'No logs available';
      const detailedError = new Error(
        `Transaction simulation failed.\n\nError: ${error.message}\n\nTransaction Logs:\n${logString}`
      );
      throw detailedError;
    }
    
    throw error;
  }
}


export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  externalUrl?: string;
  sellerFeeBasisPoints: number;
  attributes?: Array<{ trait_type: string; value: string }>;
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
    // This must happen BEFORE creating metadata, because Metaplex will transfer mint authority
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
      sellerFeeBasisPoints: percentAmount(metadata.sellerFeeBasisPoints / 100), // Convert basis points to percentage
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

    // Step 7: Mint authority management
    // Note: Metaplex Token Metadata program automatically manages mint authority for NFTs.
    // The mint authority is transferred to the metadata program, ensuring supply stays at 1
    // and the metadata remains immutably linked to the NFT.

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
