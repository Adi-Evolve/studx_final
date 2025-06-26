'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setMessage(messageParam);
    }
  }, [searchParams]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/home');
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    
    const currentOrigin = window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${currentOrigin}/auth/callback`,
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

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-slate-100/60 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
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
              Welcome Back to Your
              <br />
              <span className="text-emerald-400">Student Marketplace</span>
            </h2>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-md">
              Your marketplace awaits! Reconnect with thousands of students and discover amazing deals on everything you need.
            </p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-3xl font-black text-emerald-400">10K+</div>
                <div className="text-slate-300 text-sm">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400">50K+</div>
                <div className="text-slate-300 text-sm">Items Sold</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400">500+</div>
                <div className="text-slate-300 text-sm">Colleges</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400">4.9★</div>
                <div className="text-slate-300 text-sm">User Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 relative">
                <span className="text-xl font-black text-white">SX</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              <h1 className="text-3xl font-black text-slate-900">StudX</h1>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-600">Sign in to continue your student marketplace journey</p>
              </div>

              {/* Success Message */}
              {message && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 text-xl">✅</span>
                    <p className="text-emerald-700 text-sm font-medium">{message}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400">📧</span>
                    </div>
                    <input
                      type="email"
                      placeholder="your.email@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-base pl-12"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400">🔒</span>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                      <span className="text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? "🙈" : "👁️"}
                      </span>
                    </button>
                  </div>
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
                      Signing In...
                    </div>
                  ) : (
                    <>🚀 Sign In</>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-slate-500 text-sm font-medium">OR</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
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
              </form>

              {/* Signup Link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Create Account &rarr;
                  </Link>
                </p>
              </div>

              {/* Forgot Password */}
              <div className="mt-4 text-center">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Secure Login
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                Student Verified
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Trusted Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
