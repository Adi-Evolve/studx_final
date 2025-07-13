'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const messageParam = urlParams.get('message');
      if (messageParam) {
        setMessage(messageParam);
      }
    }
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setLoginError('Please check your email and click the confirmation link before signing in.');
      } else if (error.message.includes('Invalid login credentials')) {
        setLoginError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setLoginError(error.message);
      }
      setIsLoading(false);
    } else {
      setMessage('Login successful! Redirecting...');
      setIsLoading(false);
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="flex flex-col justify-center items-center text-center p-12 text-white">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
            <span className="text-2xl font-black text-white">SX</span>
          </div>
          <h1 className="text-5xl font-black mb-6 text-white">StudX</h1>
          <h2 className="text-3xl font-bold mb-8 leading-tight text-slate-200">
            Welcome Back to Your
            <br />
            <span className="text-emerald-400">Student Marketplace</span>
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed max-w-md">
            Your marketplace awaits! Reconnect with thousands of students and discover amazing deals.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
              <span className="text-xl font-black text-white">SX</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">StudX</h1>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-600">Sign in to your StudX account</p>
            </div>
            {message && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-emerald-700 text-sm font-medium">{message}</p>
              </div>
            )}
            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{loginError}</p>
              </div>
            )}
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  "🚀 Sign In"
                )}
              </button>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-500 text-sm font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  // Determine the correct redirect URL based on environment
                  const currentOrigin = window.location.origin;
                  const redirectUrl = currentOrigin.includes('localhost') || 
                                    currentOrigin.includes('127.0.0.1') || 
                                    currentOrigin.includes('192.168.') ||
                                    currentOrigin.startsWith('http://10.') ||
                                    currentOrigin.includes('dev')
                    ? `${currentOrigin}/auth/callback`
                    : `https://studxchnage.vercel.app/auth/callback`;
                  
                  console.log('🔗 Google OAuth redirect URL:', redirectUrl);
                  
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: redirectUrl,
                    },
                  });
                  if (error) {
                    setLoginError(error.message);
                  }
                }}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
