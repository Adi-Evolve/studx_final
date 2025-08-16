"use client";

export default function TermsOfService() {
  // Razorpay demo payment handler
  const handleDemoPayment = async () => {
    if (typeof window === 'undefined') return;
    // Step 1: Create order via backend
    const res = await fetch('/api/razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100, currency: 'INR' }) // 100 INR
    });
    const order = await res.json();
    // Step 2: Load Razorpay script if needed
    function openRazorpay() {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Fetch from environment variables
        amount: order.amount,
        currency: order.currency,
        name: 'StudXchange',
        image: '/favicon.ico',
        order_id: order.id,
        handler: function (response) {
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
        },
        prefill: {
          name: 'Demo User',
          email: 'demo@studxchange.in',
        },
        theme: {
          color: '#10b981',
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = openRazorpay;
      document.body.appendChild(script);
    } else {
      openRazorpay();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <div>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">Terms of Service</h1>
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-md dark:shadow-gray-700">
            <div className="space-y-6">
              {/* All sections and content as before */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  By accessing and using StudXchange, you accept and agree to be bound by the terms and provision of this agreement. 
                  These Terms of Service constitute a legal agreement between you and StudXchange.
                </p>
              </section>
              {/* ...all other sections... */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">9. Changes to Terms</h2>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may update these terms from time to time. Users will be notified of significant changes and continued 
                  use constitutes acceptance of updated terms.
                </p>
              </section>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-12 py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
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