'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else {
        // Check if user needs email confirmation
        if (!data.session && data.user && !data.user.email_confirmed_at) {
          setConfirmationSent(true);
        } else {
          // User is already confirmed, redirect to home
          router.push('/');
        }
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);
    
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${currentOrigin}/auth/callback?next=/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: false,
      },
    });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Email confirmation success screen
  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100/40 dark:bg-emerald-900/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-slate-100/60 dark:bg-slate-800/60 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-gray-700 text-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📧</span>
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Check Your Email!</h1>
            
            <p className="text-slate-600 dark:text-gray-300 mb-6 leading-relaxed">
              We've sent a confirmation link to <strong>{email}</strong>. 
              Click the link in the email to activate your account and start using StudX.
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 text-lg">💡</span>
                <div className="text-left">
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium mb-1">Pro Tip:</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">Check your spam folder if you don't see the email within a few minutes.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setConfirmationSent(false)}
                className="btn-primary w-full"
              >
                ← Back to Signup
              </button>
              
              <Link
                href="/login"
                className="btn-secondary w-full block text-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100/40 dark:bg-emerald-900/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-slate-100/60 dark:bg-slate-800/60 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-gray-950 relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
            {/* StudX Logo */}
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 relative">
              <span className="text-2xl font-black text-white">SX</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>

            <h1 className="text-5xl font-black mb-6 text-white">
              StudX
            </h1>

            <h2 className="text-3xl font-bold mb-8 leading-tight text-slate-200">
              Join the Student
              <br />
              <span className="text-emerald-400">Marketplace Revolution</span>
            </h2>

            <p className="text-xl text-slate-300 leading-relaxed max-w-md">
              Connect with 10,000+ students across 500+ colleges. Buy, sell, and discover everything you need for student life.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4">
              {[
                { icon: '🚀', text: 'Instant setup in 30 seconds' },
                { icon: '🔒', text: 'Bank-level security' },
                { icon: '🎓', text: 'Verified student community' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4 text-slate-200">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 relative">
                <span className="text-xl font-black text-white">SX</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">StudX</h1>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Account</h2>
                <p className="text-slate-600 dark:text-gray-300">Join thousands of students already on StudX</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400">👤</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-base pl-12"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400">📧</span>
                    </div>
                    <input
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-base pl-12"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400">🔒</span>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-base pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {showPassword ? "🙈" : "👁️"}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">Password must be at least 6 characters long</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`btn-primary w-full text-lg py-4 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <>🚀 Create Account</>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-gray-600"></div>
                  <span className="text-slate-500 dark:text-gray-400 text-sm font-medium">OR</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-gray-600"></div>
                </div>

                {/* Google Sign Up */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="btn-secondary w-full py-4 flex items-center justify-center gap-3"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Email Confirmation Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-lg">📧</span>
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">Important: Email Confirmation Required</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">After signing up, you'll receive a confirmation email. You must click the link in that email before you can log in to your account.</p>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <p className="text-xs text-slate-500 dark:text-gray-400 text-center leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                    Privacy Policy
                  </Link>
                </p>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600 dark:text-gray-300">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    Sign In →
                  </Link>
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Free Forever
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                Secure & Private
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Email Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
