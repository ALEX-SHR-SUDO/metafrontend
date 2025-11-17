import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* 404 Icon */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              404
            </h1>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-300 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>

          {/* Back to Home Button */}
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
