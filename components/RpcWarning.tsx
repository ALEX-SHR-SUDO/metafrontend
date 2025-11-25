'use client';

import React, { useEffect, useState } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { isValidRpcEndpoint } from '@/utils/rpc';

export function RpcWarning() {
  const { isMainnet } = useNetwork();
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show warning on mainnet when no custom RPC is configured
    if (isMainnet) {
      const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET;
      const hasValidRpc = isValidRpcEndpoint(customEndpoint);
      
      // Check if user has dismissed the warning before
      const isDismissed = localStorage.getItem('rpc-warning-dismissed') === 'true';
      
      setShowWarning(!hasValidRpc && !isDismissed);
    } else {
      setShowWarning(false);
    }
  }, [isMainnet]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowWarning(false);
    localStorage.setItem('rpc-warning-dismissed', 'true');
  };

  if (!showWarning || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            RPC Endpoint Configuration Required for Mainnet
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You&apos;re using the public Solana RPC endpoint which has strict rate limits and may cause 403 errors.
              For reliable mainnet usage, please configure a custom RPC endpoint.
            </p>
            <div className="mt-3">
              <h4 className="font-medium">How to fix:</h4>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>Get a free RPC endpoint from <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="underline font-medium">Helius</a> or <a href="https://quicknode.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">QuickNode</a></li>
                <li>
                  <strong>For Vercel/Production:</strong> Add environment variable in Vercel Dashboard and redeploy.
                  See <a href="https://github.com/ALEX-SHR-SUDO/metafrontend/blob/main/VERCEL_RPC_SETUP.md" target="_blank" rel="noopener noreferrer" className="underline font-medium">Vercel Setup Guide</a>
                </li>
                <li>
                  <strong>For Local Development:</strong> Create <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_SOLANA_RPC_MAINNET=your_rpc_url</code> and restart server
                </li>
              </ol>
              <p className="mt-2">
                See the <a href="https://github.com/ALEX-SHR-SUDO/metafrontend/blob/main/RPC_CONFIGURATION.md" target="_blank" rel="noopener noreferrer" className="underline font-medium">RPC Configuration Guide</a> for detailed instructions.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
