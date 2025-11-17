'use client';

import dynamic from 'next/dynamic';

// Import TokenCreator with no SSR to prevent hydration issues
const TokenCreator = dynamic(() => import('./TokenCreator'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  ),
});

export default function ClientTokenCreator() {
  return <TokenCreator />;
}
