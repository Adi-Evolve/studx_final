'use client';

import Link from 'next/link';

function OldProductPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-4xl font-bold text-primary mb-4">Page Has Moved</h1>
      <p className="text-lg text-secondary mb-8 max-w-md">
        We've updated our website and this product page has a new home. Please find it via our homepage.
      </p>
      <Link href="/" className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition-transform transform hover:scale-105 duration-300 shadow-lg">
        Go to Homepage
      </Link>
    </div>
  );
}

export default OldProductPage;
