import { Suspense } from 'react';

// Minimal test to identify the problematic component
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">StudXchange Homepage</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-4">Testing Component Imports</h2>
        <p>This is a minimal version to test for component import issues.</p>
      </div>
      
      {/* Test basic sections without complex data fetching */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💻</div>
            <span className="text-sm">Laptops</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📚</div>
            <span className="text-sm">Textbooks</span>
          </div>
        </div>
      </section>
    </div>
  );
}
