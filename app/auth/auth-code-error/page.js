import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">
          Something went wrong during the authentication process. The link may have expired or been used already.
        </p>
        <Link href="/login" legacyBehavior>
          <a className="bg-accent hover:bg-primary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
            Try Logging In Again
          </a>
        </Link>
      </div>
    </div>
  );
}
