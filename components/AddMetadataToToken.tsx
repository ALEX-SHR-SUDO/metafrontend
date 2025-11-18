'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { uploadImageToPinata, uploadMetadataToPinata } from '@/utils/pinata';
import { addMetadataToExistingToken, ExistingTokenMetadata } from '@/utils/solana';
import { getSolanaNetwork, getSolanaExplorerUrl } from '@/utils/helpers';
import { useNetwork } from '@/contexts/NetworkContext';
import NetworkSwitcher from './NetworkSwitcher';

export default function AddMetadataToToken() {
  const [mounted, setMounted] = useState(false);
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { network } = useNetwork();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<ExistingTokenMetadata>({
    name: '',
    symbol: '',
    description: '',
    image: '',
  });

  const [mintAddress, setMintAddress] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [transactionSignature, setTransactionSignature] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setTransactionSignature('');

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!signTransaction) {
      setError('Wallet does not support signing transactions');
      return;
    }

    if (!mintAddress) {
      setError('Please enter a token mint address');
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
        external_url: '',
        seller_fee_basis_points: 0,
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

      // Step 3: Add metadata to existing token
      setStatus('Adding metadata to token on Solana...');
      const tokenFormData: ExistingTokenMetadata = {
        ...formData,
        image: imageUri,
      };

      const signature = await addMetadataToExistingToken(
        connection,
        publicKey,
        mintAddress,
        tokenFormData,
        metadataUri,
        signTransaction
      );

      setTransactionSignature(signature);
      setStatus('Metadata added successfully!');
      console.log('Metadata added. Transaction:', signature);

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        image: '',
      });
      setMintAddress('');
      setLogoFile(null);
      setLogoPreview('');
    } catch (err) {
      console.error('Error adding metadata:', err);
      setError(err instanceof Error ? err.message : 'Failed to add metadata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-center gap-4 mb-6">
            <a
              href="/"
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Create New Token
            </a>
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">
              Add Metadata to Existing Token
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Add Metadata to Existing Token
            </h1>
            <p className="text-gray-300">
              Add on-chain metadata to tokens that don&apos;t have it yet
            </p>
          </div>

          {/* Wallet Connection and Network Switcher */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex justify-center">
              {mounted ? (
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700" />
              ) : (
                <div className="h-12 w-40 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg animate-pulse"></div>
              )}
            </div>
            {mounted && <NetworkSwitcher />}
          </div>

          {/* Main Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mint Address */}
              <div>
                <label htmlFor="mintAddress" className="block text-sm font-medium text-white mb-2">
                  Token Mint Address *
                </label>
                <input
                  type="text"
                  id="mintAddress"
                  name="mintAddress"
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="BdXtKHC6NAfnmopy7qip76qTXYGKPkqNZb19QRAyu77o"
                  required
                />
                <p className="mt-2 text-xs text-gray-400">
                  The address of the token that needs metadata
                </p>
              </div>

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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !publicKey || !mounted}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? 'Adding Metadata...' : !mounted ? 'Loading...' : publicKey ? 'Add Metadata' : 'Connect Wallet First'}
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
                <p className="text-red-200 whitespace-pre-wrap">{error}</p>
              </div>
            )}

            {transactionSignature && (
              <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-200 font-semibold mb-2">Transaction Signature:</p>
                <p className="text-white font-mono text-sm break-all mb-2">{transactionSignature}</p>
                <a
                  href={getSolanaExplorerUrl(transactionSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-300 hover:text-blue-200 underline"
                >
                  View Transaction on Explorer →
                </a>
                <div className="mt-4 pt-4 border-t border-green-500/30">
                  <p className="text-green-200 font-semibold mb-2">Check your token:</p>
                  <a
                    href={`https://solscan.io/token/${mintAddress}?cluster=${getSolanaNetwork()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-300 hover:text-blue-200 underline"
                  >
                    View Token on Solscan →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Make sure you have some SOL in your wallet to pay for transaction fees.</p>
            <p className="mt-2">
              Network: <span className={network === 'mainnet-beta' ? 'text-green-400 font-semibold' : 'text-purple-400 font-semibold'}>{network}</span>
            </p>
            <p className="mt-2 text-yellow-300">
              ⚠️ Note: You must be the mint authority to add metadata to a token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
