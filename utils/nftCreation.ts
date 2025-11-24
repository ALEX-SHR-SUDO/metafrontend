import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createNFT, NFTMetadata } from './nftToken';

/**
 * Interface for NFT creation input data from the form
 */
export interface NFTFormData {
  name: string;
  symbol: string;
  description: string;
  externalUrl: string;
  sellerFeeBasisPoints: number;
  attributes: Array<{ trait_type: string; value: string }>;
}

/**
 * Interface for status callback during NFT creation process
 */
export type StatusCallback = (status: string) => void;

/**
 * Convert form data to NFTMetadata object for Solana
 * @param formData - The form data containing NFT information
 * @param imageUri - The IPFS URI of the uploaded image
 * @returns NFTMetadata object for Solana
 */
export function formDataToNFTMetadata(
  formData: NFTFormData,
  imageUri: string
): NFTMetadata {
  return {
    name: formData.name,
    symbol: formData.symbol,
    description: formData.description,
    image: imageUri,
    externalUrl: formData.externalUrl,
    sellerFeeBasisPoints: formData.sellerFeeBasisPoints,
    attributes: formData.attributes,
  };
}

/**
 * Create metadata object for NFT
 * @param formData - The form data containing NFT information
 * @param imageUri - The IPFS URI of the uploaded image
 * @returns Metadata object ready for upload to IPFS
 */
export function createNFTMetadata(
  formData: NFTFormData,
  imageUri: string
): Record<string, any> {
  const metadata: Record<string, any> = {
    name: formData.name,
    symbol: formData.symbol,
    description: formData.description,
    image: imageUri,
    seller_fee_basis_points: formData.sellerFeeBasisPoints,
  };

  // Add optional fields only if they have values
  if (formData.externalUrl) {
    metadata.external_url = formData.externalUrl;
  }

  if (formData.attributes.length > 0) {
    metadata.attributes = formData.attributes;
  }

  return metadata;
}

/**
 * Complete NFT creation workflow
 * This function handles the entire process of creating an NFT:
 * 1. Upload image to IPFS
 * 2. Create and upload metadata to IPFS
 * 3. Create NFT on Solana blockchain
 * 
 * @param connection - Solana connection
 * @param publicKey - User's wallet public key
 * @param formData - Form data containing NFT information
 * @param imageFile - The image file to upload
 * @param signTransaction - Function to sign transactions with the wallet
 * @param onStatusChange - Callback to report status updates
 * @returns The mint address of the created NFT
 */
export async function createNFTWithMetadata(
  connection: Connection,
  publicKey: PublicKey,
  formData: NFTFormData,
  imageFile: File,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  onStatusChange?: StatusCallback
): Promise<string> {
  // Step 1: Upload image to IPFS
  onStatusChange?.('Uploading image to IPFS...');
  const { uploadImageToPinata } = await import('./pinata');
  const imageUri = await uploadImageToPinata(imageFile);
  console.log('Image uploaded to IPFS:', imageUri);

  // Step 2: Create metadata object
  onStatusChange?.('Creating metadata...');
  const metadata = createNFTMetadata(formData, imageUri);

  // Step 3: Upload metadata to IPFS
  onStatusChange?.('Uploading metadata to IPFS...');
  const { uploadMetadataToPinata } = await import('./pinata');
  const metadataUri = await uploadMetadataToPinata(metadata);
  console.log('Metadata uploaded to IPFS:', metadataUri);

  // Step 4: Create NFT on Solana
  onStatusChange?.('Creating NFT on Solana blockchain...');
  const nftMetadata = formDataToNFTMetadata(formData, imageUri);

  const mintAddress = await createNFT(
    connection,
    publicKey,
    nftMetadata,
    metadataUri,
    signTransaction
  );

  return mintAddress;
}
