'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getSolanaExplorerUrl } from '@/utils/helpers';
import { useNetwork } from '@/contexts/NetworkContext';
import NetworkSwitcher from './NetworkSwitcher';
import { RpcWarning } from './RpcWarning';
import { NFTFormData, createNFTWithMetadata } from '@/utils/nftCreation';

export default function NFTCreator() {
  const [mounted, setMounted] = useState(false);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { network } = useNetwork();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<NFTFormData>({
    name: '',
    symbol: '',
    description: '',
    externalUrl: '',
    sellerFeeBasisPoints: 500,
    attributes: [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [error, setError] = useState('');
  const [currentAttribute, setCurrentAttribute] = useState({ trait_type: '', value: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sellerFeeBasisPoints' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAttribute = () => {
    if (currentAttribute.trait_type && currentAttribute.value) {
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, currentAttribute],
      }));
      setCurrentAttribute({ trait_type: '', value: '' });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
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

    if (!wallet.signTransaction) {
      setError('Wallet does not support signing transactions');
      return;
    }

    if (!imageFile) {
      setError('Please select an image for your NFT');
      return;
    }

    if (!formData.name || !formData.symbol) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Use the extracted NFT creation utility function
      const mintAddr = await createNFTWithMetadata(
        connection,
        publicKey,
        formData,
        imageFile,
        wallet.signTransaction,
        (status) => setStatus(status)
      );

      setMintAddress(mintAddr);
      setStatus('NFT created successfully! 🎉');
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        externalUrl: '',
        sellerFeeBasisPoints: 500,
        attributes: [],
      });
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error creating NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to create NFT');
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
              NFT Creator
            </h1>
            <p className="text-gray-300">
              Create your unique NFT on Solana blockchain
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

          {/* RPC Configuration Warning */}
          {mounted && <RpcWarning />}

          {/* Main Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NFT Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  NFT Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="My Amazing NFT"
                  required
                />
              </div>

              {/* NFT Symbol */}
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-white mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="NFT"
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
                  placeholder="Describe your NFT..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-white mb-2">
                  NFT Image *
                </label>
                <div className="flex items-center space-x-4">
                  {imagePreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/20">
                      <img src={imagePreview} alt="NFT preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-center">
                      {imageFile ? imageFile.name : 'Choose file'}
                    </div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>

              {/* External URL */}
              <div>
                <label htmlFor="externalUrl" className="block text-sm font-medium text-white mb-2">
                  External URL
                </label>
                <input
                  type="url"
                  id="externalUrl"
                  name="externalUrl"
                  value={formData.externalUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* Seller Fee */}
              <div>
                <label htmlFor="sellerFeeBasisPoints" className="block text-sm font-medium text-white mb-2">
                  Seller Fee Basis Points (Royalty %)
                </label>
                <input
                  type="number"
                  id="sellerFeeBasisPoints"
                  name="sellerFeeBasisPoints"
                  value={formData.sellerFeeBasisPoints}
                  onChange={handleInputChange}
                  min="0"
                  max="10000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">500 = 5% royalty. Max: 10000 (100%)</p>
              </div>

              {/* Attributes Section */}
              <div className="space-y-4 pt-4 border-t border-white/20">
                <div className="text-sm font-medium text-white mb-3">
                  Attributes (Optional)
                  <p className="text-xs text-gray-400 mt-1">Add traits and properties to your NFT</p>
                </div>

                {/* Current Attributes */}
                {formData.attributes.length > 0 && (
                  <div className="space-y-2">
                    {formData.attributes.map((attr, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <span className="text-gray-400 text-xs">{attr.trait_type}:</span>
                          <span className="text-white ml-2">{attr.value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Attribute Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentAttribute.trait_type}
                    onChange={(e) => setCurrentAttribute({ ...currentAttribute, trait_type: e.target.value })}
                    placeholder="Trait Type (e.g., Background)"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={currentAttribute.value}
                    onChange={(e) => setCurrentAttribute({ ...currentAttribute, value: e.target.value })}
                    placeholder="Value (e.g., Blue)"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    disabled={!currentAttribute.trait_type || !currentAttribute.value}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !publicKey || !mounted}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? 'Creating NFT...' : !mounted ? 'Loading...' : publicKey ? 'Create NFT' : 'Connect Wallet First'}
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

            {mintAddress && (
              <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-200 font-semibold mb-2">NFT Mint Address:</p>
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
            <p className="mt-2">
              Network: <span className={network === 'mainnet-beta' ? 'text-green-400 font-semibold' : 'text-purple-400 font-semibold'}>{network}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
