'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// // import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async (e) => {
    e.preventDefault();
    // const toastId = toast.loading('Signing in...');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // toast.error(error.message, { id: toastId });
    } else {
      // toast.success('Logged in successfully!', { id: toastId });
      router.push('/home');
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      // toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-accent mb-6">Login to StudXchange</h2>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="block text-primary text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-primary text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-light-text mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-accent hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
            <p className="text-center font-semibold mx-4 mb-0">OR</p>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-secondary hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faGoogle} className="mr-2" />
          Sign in with Google
        </button>
        <p className="text-center text-secondary text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-accent hover:text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
