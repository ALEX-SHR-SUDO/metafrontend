'use client';

import dynamic from 'next/dynamic';

// Import NFTCreator with no SSR to prevent hydration issues
const NFTCreator = dynamic(() => import('./NFTCreator'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  ),
});

export default function ClientNFTCreator() {
  return <NFTCreator />;
}
