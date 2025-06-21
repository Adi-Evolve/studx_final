'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// // import toast from 'react-hot-toast';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    // const toastId = toast.loading('Creating account...');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      // toast.error(error.message, { id: toastId });
    } else {
      // toast.success('Check your email for the confirmation link! Please check your email to verify.', { id: toastId, duration: 5000 });
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-accent mb-6">Create an Account</h2>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-primary text-sm font-bold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
              Sign Up
            </button>
          </div>
        </form>
        <p className="text-center text-secondary text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-accent hover:text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
