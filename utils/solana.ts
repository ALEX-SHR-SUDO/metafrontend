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

    // Add instruction to create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Add instruction to initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mintPublicKey,
        metadata.decimals,
        payer,
        payer,
        TOKEN_PROGRAM_ID
      )
    );

    // Get associated token account address
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      payer,
      false,
      TOKEN_PROGRAM_ID
    );

    // Add instruction to create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        payer,
        mintPublicKey,
        TOKEN_PROGRAM_ID
      )
    );

    // Add instruction to mint tokens
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

    // Sign with wallet
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    console.log('Token created successfully. Mint address:', mintPublicKey.toString());
    console.log('Metadata URI (off-chain):', metadataUri);
    console.log('Note: This creates an SPL token with off-chain metadata stored on IPFS.');
    console.log('The metadata URI is provided as a reference but not stored on-chain via Metaplex.');

    return mintPublicKey.toString();
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

