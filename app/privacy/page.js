export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">Privacy Policy</h1>
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-md dark:shadow-gray-700">
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We collect information you provide directly to us, such as when you create an account, post listings, or contact us.
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-2">
                <li>Account information (name, email, phone number)</li>
                <li>Profile information and photos</li>
                <li>Listing content and images</li>
                <li>Communication and transaction history</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-2">
                <li>To provide and maintain our platform services</li>
                <li>To process transactions and communications</li>
                <li>To improve user experience and platform functionality</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To send important updates and notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">3. Information Sharing</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                We do not sell or rent your personal information to third parties. We may share information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-2 mt-3">
                <li>With your consent</li>
                <li>To facilitate transactions between users</li>
                <li>To comply with legal obligations</li>
                <li>To protect rights, property, or safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">4. Data Security</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">5. Google OAuth</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                We use Google OAuth for secure authentication. We only access basic profile information (name, email, profile picture) with your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>Request information about data we collect</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">7. Contact Us</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at: 
                <a href="mailto:adiinamdar888@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"> adiinamdar888@gmail.com</a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
