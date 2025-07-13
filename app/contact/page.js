export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">Contact Us</h1>
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-md dark:shadow-gray-700">
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                We'd love to hear from you! Whether you have questions, feedback, or need support, 
                our team is here to help make your StudXchange experience as smooth as possible.
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-gray-700 dark:text-gray-300">adiinamdar888@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Office</p>
                      <p className="text-gray-700 dark:text-gray-300">123 University Ave<br />Student Innovation Center<br />College City, State 12345</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                      <p className="text-gray-700 dark:text-gray-300">+91 8857053541</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Support Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Monday - Sunday</span>
                    <span className="text-gray-900 dark:text-white font-medium">Any Time</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  * We're available 24/7 to assist you with any questions or concerns
                </p>
              </section>
            </div>

            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">How do I verify my student status?</h4>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    We verify student status through your .edu email address during registration. 
                    If you're having trouble, contact us with your student ID.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">What if I have issues with a transaction?</h4>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    While transactions are between users, we're happy to help mediate disputes. 
                    Contact us with details about the issue and we'll work to find a resolution.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">How can I report inappropriate content?</h4>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    Use the report button on any listing or user profile, or email us directly at support@studxchange.com 
                    with details about the concerning content.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Response Guarantee</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                We typically respond to all inquiries within 24 hours during business days. 
                For urgent issues, please call our support line and leave a detailed message.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
