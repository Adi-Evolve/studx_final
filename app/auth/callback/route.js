import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home'; // Changed default redirect to /home

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // After successful login, update the user's profile in the 'users' table.
      // The initial profile creation is handled by the 'handle_new_user' trigger.
      // This upsert ensures that if a user updates their name or avatar on Google,
      // it will be reflected in our database on their next login.
      const { user } = data;
      const userProfile = {
        id: user.id,
        // Only include name and avatar_url if they exist in the metadata
        ...(user.user_metadata.name && { name: user.user_metadata.name }),
        ...(user.user_metadata.avatar_url && { avatar_url: user.user_metadata.avatar_url }),
      };

      const { error: upsertError } = await supabase.from('users').upsert(userProfile, { onConflict: 'id' });

      if (upsertError) {
        console.error('Error saving user data:', upsertError);
        // Redirect to an error page even if login was successful but db write failed
        return NextResponse.redirect(`${origin}/auth/auth-code-error?message=Could not save user profile.`);
      }

      // Always redirect to /home after successful authentication
      return NextResponse.redirect(`${origin}/home`);
    } else if (error) {
      console.error('Authentication error:', error.message);
    }
  }

  // Redirect to an error page if the code is missing or if there's an error
  const errorMessage = 'Something went wrong during the authentication process.';
  return NextResponse.redirect(`${origin}/auth/auth-code-error?message=${encodeURIComponent(errorMessage)}`);
}
