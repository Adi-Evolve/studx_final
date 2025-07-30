import React from 'react';

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col justify-between">
      <div>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Cancellation Policy</h1>
            <p className="text-slate-600 dark:text-gray-300 text-lg mb-6">
              You may cancel your order within 24 hours of purchase for a full refund. After this period, cancellations may not be eligible for a refund. Please review our terms and conditions for more details.
            </p>
            <ul className="list-disc pl-6 text-slate-500 dark:text-gray-400 mb-6">
              <li>Orders can be cancelled within 24 hours of purchase.</li>
              <li>Contact us at <a href="mailto:support@studxchange.in" className="text-blue-500">support@studxchange.in</a> for cancellation requests.</li>
              <li>Refunds for cancelled orders will be processed as per our refund policy.</li>
            </ul>
          </div>
        </div>
      </div>
      <footer className="bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 py-6 mt-8">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-4 text-sm text-slate-600 dark:text-gray-300">
          <a href="/terms" className="hover:text-blue-500">Terms &amp; Conditions</a>
          <a href="/privacy" className="hover:text-blue-500">Privacy Policy</a>
          <a href="/refund" className="hover:text-blue-500">Refund Policy</a>
          <a href="/cancellation" className="hover:text-blue-500">Cancellation Policy</a>
          <a href="/contact" className="hover:text-blue-500">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
