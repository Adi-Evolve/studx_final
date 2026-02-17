// HIDDEN: This page is temporarily hidden but not deleted
// To re-enable, restore the original mess management code

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MessManagementPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page - mess section is hidden
    router.push('/profile');
  }, [router]);

  return null;
}