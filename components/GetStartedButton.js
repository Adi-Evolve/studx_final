'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function GetStartedButton() {
  const [user, setUser] = useState(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, [supabase.auth]);

  return (
    <Link href={user ? '/home' : '/login'} className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition duration-300">
      Get Started
    </Link>
  );
}
