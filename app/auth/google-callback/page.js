'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;
    // Exchange code for tokens
    fetch(`/api/auth/google-callback?code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem('google_access_token', data.access_token);
          // Optionally store refresh_token if needed
        }
        // Redirect to notes page or wherever needed
        router.replace('/products/notes');
      });
  }, [searchParams, router]);

  return <div className="p-8 text-center">Authenticating with Google&hellip;</div>;
}
