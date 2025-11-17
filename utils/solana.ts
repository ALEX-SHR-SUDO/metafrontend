import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
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
} from '@metaplex-foundation/mpl-token-metadata';
import {
  percentAmount,
  some,
  none,
  createSignerFromKeypair,
} from '@metaplex-foundation/umi';
import { 
  toWeb3JsInstruction,
  fromWeb3JsKeypair,
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

export async function createTokenWithMetadata(
  connection: Connection,
  payer: PublicKey,
  metadata: TokenMetadata,
  metadataUri: string,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
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
        payer,
        TOKEN_PROGRAM_ID
      )
    );

    // Step 3: Create Metaplex metadata using UMI
    const umi = createUmi(connection.rpcEndpoint);
    
    // Convert the mint keypair to UMI format
    const mintUmiKeypair = fromWeb3JsKeypair(mintKeypair);
    const mintUmiSigner = createSignerFromKeypair(umi, mintUmiKeypair);
    
    // Set the signer identity on the UMI instance to avoid NullSigner error
    umi.use({
      install(umi) {
        umi.identity = mintUmiSigner;
        umi.payer = mintUmiSigner;
      }
    });

    // Build the createV1 instruction for metadata
    const createMetadataIx = createV1(umi, {
      mint: mintUmiSigner,
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
    console.log('Transaction signature:', signature);

    return mintPublicKey.toString();
  } catch (error) {
    console.error('Error creating token with Metaplex metadata:', error);
    throw error;
  }
}

