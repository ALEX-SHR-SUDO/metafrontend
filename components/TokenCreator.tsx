'use client';

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { uploadImageToPinata, uploadMetadataToPinata } from '@/utils/pinata';
import { createTokenWithMetadata, TokenMetadata } from '@/utils/solana';
import { getSolanaNetwork, getSolanaExplorerUrl } from '@/utils/helpers';

export default function TokenCreator() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [formData, setFormData] = useState<TokenMetadata>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    decimals: 9,
    supply: 1000000,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'decimals' || name === 'supply' ? Number(value) : value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setMintAddress('');

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!signTransaction) {
      setError('Wallet does not support signing transactions');
      return;
    }

    if (!logoFile) {
      setError('Please select a logo image');
      return;
    }

    if (!formData.name || !formData.symbol) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload logo to Pinata
      setStatus('Uploading logo to IPFS...');
      const imageUri = await uploadImageToPinata(logoFile);
      console.log('Logo uploaded:', imageUri);

      // Step 2: Create metadata object and upload to Pinata
      setStatus('Creating metadata...');
      const metadata = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: imageUri,
        attributes: [],
        properties: {
          files: [
            {
              uri: imageUri,
              type: logoFile.type,
            },
          ],
          category: 'image',
        },
      };

      const metadataUri = await uploadMetadataToPinata(metadata);
      console.log('Metadata uploaded:', metadataUri);

      // Step 3: Create token with metadata
      setStatus('Creating token on Solana...');
      const tokenFormData: TokenMetadata = {
        ...formData,
        image: imageUri,
      };

      const mint = await createTokenWithMetadata(
        connection,
        publicKey,
        tokenFormData,
        metadataUri,
        signTransaction
      );

      setMintAddress(mint);
      setStatus('Token created successfully!');
      console.log('Token created:', mint);

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        image: '',
        decimals: 9,
        supply: 1000000,
      });
      setLogoFile(null);
      setLogoPreview('');
    } catch (err) {
      console.error('Error creating token:', err);
      setError(err instanceof Error ? err.message : 'Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              SPL Token Creator
            </h1>
            <p className="text-gray-300">
              Create your Solana token with metadata on-chain
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700" />
          </div>

          {/* Main Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="My Token"
                  required
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-white mb-2">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="MTK"
                  maxLength={10}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe your token..."
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-white mb-2">
                  Token Logo *
                </label>
                <div className="flex items-center space-x-4">
                  {logoPreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/20">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-center">
                      {logoFile ? logoFile.name : 'Choose file'}
                    </div>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Decimals */}
              <div>
                <label htmlFor="decimals" className="block text-sm font-medium text-white mb-2">
                  Decimals
                </label>
                <input
                  type="number"
                  id="decimals"
                  name="decimals"
                  value={formData.decimals}
                  onChange={handleInputChange}
                  min="0"
                  max="9"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Supply */}
              <div>
                <label htmlFor="supply" className="block text-sm font-medium text-white mb-2">
                  Initial Supply
                </label>
                <input
                  type="number"
                  id="supply"
                  name="supply"
                  value={formData.supply}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !publicKey}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? 'Creating Token...' : publicKey ? 'Create Token' : 'Connect Wallet First'}
              </button>
            </form>

            {/* Status Messages */}
            {status && (
              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-200">{status}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {mintAddress && (
              <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-200 font-semibold mb-2">Token Mint Address:</p>
                <p className="text-white font-mono text-sm break-all">{mintAddress}</p>
                <a
                  href={getSolanaExplorerUrl(mintAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-300 hover:text-blue-200 underline"
                >
                  View on Solana Explorer →
                </a>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Make sure you have some SOL in your wallet to pay for transaction fees.</p>
            <p className="mt-2">Network: {getSolanaNetwork()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
