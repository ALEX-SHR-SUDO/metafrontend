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

/**
 * Helper function to determine the Solana cluster from RPC endpoint
 */
function getClusterFromRpcEndpoint(rpcEndpoint: string): string {
  if (rpcEndpoint.includes('devnet')) {
    return 'devnet';
  } else if (rpcEndpoint.includes('testnet')) {
    return 'testnet';
  }
  return 'mainnet-beta';
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

    // Step 3: Create Metaplex metadata using UMI
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

    // Calculate the metadata PDA for logging purposes
    // Use the mint public key from the signer
    const metadataPda = findMetadataPda(umi, { mint: mintUmiSigner.publicKey });
    console.log('Calculated metadata PDA:', metadataPda[0].toString());
    
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

    // Step 4: Get associated token account address
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      payer,
      false,
      TOKEN_PROGRAM_ID
    );

    // Step 5: Create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        payer,
        mintPublicKey,
        TOKEN_PROGRAM_ID
      )
    );

    // Step 6: Mint tokens to the associated token account
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

    // Step 7: Revoke mint authority if requested
    if (revokeMintAuthority) {
      transaction.add(
        createSetAuthorityInstruction(
          mintPublicKey,
          payer,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_PROGRAM_ID
        )
      );
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

    // Determine cluster for URLs based on RPC endpoint
    const cluster = getClusterFromRpcEndpoint(connection.rpcEndpoint);
    
    console.log('✅ Token created successfully!');
    console.log('✅ Mint address:', mintPublicKey.toString());
    console.log('✅ Metadata account address:', metadataPda[0].toString());
    console.log('✅ On-chain metadata created via Metaplex Token Metadata Program');
    console.log('✅ Metadata URI:', metadataUri);
    console.log('✅ Update authority:', payer.toString());
    console.log('✅ Metadata should now be visible on Solscan.io (wait 30-60 seconds for indexing)');
    if (revokeMintAuthority) {
      console.log('✅ Mint authority revoked - token supply is now fixed');
    }
    if (revokeFreezeAuthority) {
      console.log('✅ Freeze authority revoked - token accounts cannot be frozen');
    }
    console.log('✅ Transaction signature:', signature);
    console.log('\n📋 Verification URLs:');
    console.log(`   Metadata Account: https://explorer.solana.com/address/${metadataPda[0].toString()}?cluster=${cluster}`);
    console.log(`   Token on Solscan: https://solscan.io/token/${mintPublicKey.toString()}?cluster=${cluster}`);
    console.log(`   Metadata JSON: ${metadataUri}`);

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

    // Determine cluster for URLs based on RPC endpoint
    const cluster = getClusterFromRpcEndpoint(connection.rpcEndpoint);
    
    const action = existingMetadata ? 'updated' : 'added';
    console.log(`✅ Metadata ${action} successfully!`);
    console.log('✅ Mint address:', mintPublicKey.toString());
    console.log('✅ Metadata account address:', metadataPda[0].toString());
    console.log(`✅ On-chain metadata ${action} via Metaplex Token Metadata Program`);
    console.log('✅ Metadata URI:', metadataUri);
    console.log('✅ Update authority:', payerUmiPublicKey.toString());
    console.log('✅ Metadata should now be visible on Solscan.io (wait 30-60 seconds for indexing)');
    console.log('✅ Transaction signature:', signature);
    console.log('\n📋 Verification URLs:');
    console.log(`   Metadata Account: https://explorer.solana.com/address/${metadataPda[0].toString()}?cluster=${cluster}`);
    console.log(`   Token on Solscan: https://solscan.io/token/${mintPublicKey.toString()}?cluster=${cluster}`);
    console.log(`   Metadata JSON: ${metadataUri}`);

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

