'use client';

import React from 'react';
import { useNetwork } from '@/contexts/NetworkContext';

export default function NetworkSwitcher() {
  const { network, setNetwork, isMainnet } = useNetwork();

  const handleToggle = () => {
    const newNetwork = isMainnet ? 'devnet' : 'mainnet-beta';
    setNetwork(newNetwork);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
      <span className={`text-sm font-medium transition-colors ${!isMainnet ? 'text-white' : 'text-gray-400'}`}>
        Devnet
      </span>
      <button
        onClick={handleToggle}
        role="switch"
        aria-checked={isMainnet}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isMainnet ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            isMainnet ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${isMainnet ? 'text-white' : 'text-gray-400'}`}>
        Mainnet
      </span>
    </div>
  );
}
