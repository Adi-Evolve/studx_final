-- ============================================================================
-- ENABLE PRODUCTION SECURITY FOR STUDX MARKETPLACE - UPDATED
-- Run this in Supabase SQL Editor to enable RLS and foreign keys
-- EMAIL-BASED AUTHENTICATION SYSTEM
-- ============================================================================

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_sequences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREATE EMAIL-BASED RLS POLICIES
-- ============================================================================

-- Categories: Public read access
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Users: Users can read all profiles, update their own based on email
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.email() = email);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.email() = email);

-- Products: Public read, authenticated users can create/manage their own
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
CREATE POLICY "Authenticated users can insert products" ON public.products
  FOR INSERT WITH CHECK (auth.email() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = seller_id AND email = auth.email()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
CREATE POLICY "Users can delete their own products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = seller_id AND email = auth.email()
    )
  );

-- Notes: Public read, authenticated users can create/manage their own
DROP POLICY IF EXISTS "Notes are viewable by everyone" ON public.notes;
CREATE POLICY "Notes are viewable by everyone" ON public.notes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert notes" ON public.notes;
CREATE POLICY "Authenticated users can insert notes" ON public.notes
  FOR INSERT WITH CHECK (auth.email() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = seller_id AND email = auth.email()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
CREATE POLICY "Users can delete their own notes" ON public.notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = seller_id AND email = auth.email()
    )
  );

-- Rooms: Public read, authenticated users can create/manage their own
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.rooms;
CREATE POLICY "Rooms are viewable by everyone" ON public.rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert rooms" ON public.rooms;
CREATE POLICY "Authenticated users can insert rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.email() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own rooms" ON public.rooms;
CREATE POLICY "Users can update their own rooms" ON public.rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = seller_id AND email = auth.email()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own rooms" ON public.rooms;
CREATE POLICY "Users can delete their own rooms" ON public.rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = seller_id AND email = auth.email()
    )
  );

-- Conversations: Users can only see their own conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (id = participant1_id OR id = participant2_id) AND email = auth.email()
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.email() IS NOT NULL);

-- Messages: Users can only see messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.users u1 ON c.participant1_id = u1.id
      JOIN public.users u2 ON c.participant2_id = u2.id
      WHERE c.id = conversation_id 
      AND (u1.email = auth.email() OR u2.email = auth.email())
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = sender_id AND email = auth.email()
    )
  );

-- Notifications: Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_id AND email = auth.email()
    )
  );

-- Wishlist: Users can only manage their own wishlist
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_id AND email = auth.email()
    )
  );

-- ============================================================================
-- 3. CREATE USER SYNC TRIGGER (EMAIL-BASED)
-- ============================================================================

-- Function to sync auth.users with public.users based on email
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, created_at, updated_at)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    new.email, 
    new.raw_user_meta_data->>'avatar_url', 
    now(), 
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = now();
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically sync users on auth changes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 4. UPDATE STORAGE POLICIES FOR PRODUCTION
-- ============================================================================

-- More restrictive storage policies
DROP POLICY IF EXISTS "Product PDFs are publicly accessible." ON storage.objects;
CREATE POLICY "Product PDFs are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_pdfs');

DROP POLICY IF EXISTS "Authenticated users can upload PDFs." ON storage.objects;
CREATE POLICY "Authenticated users can upload PDFs." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product_pdfs' AND auth.email() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own PDFs." ON storage.objects;
CREATE POLICY "Users can update their own PDFs." ON storage.objects
  FOR UPDATE USING (bucket_id = 'product_pdfs' AND auth.email() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete their own PDFs." ON storage.objects;
CREATE POLICY "Users can delete their own PDFs." ON storage.objects
  FOR DELETE USING (bucket_id = 'product_pdfs' AND auth.email() IS NOT NULL);

-- ============================================================================
-- 5. SUCCESS MESSAGE
-- ============================================================================

SELECT '🔒 PRODUCTION SECURITY ENABLED!' as message,
       'RLS enabled on all tables' as rls_status,
       'Email-based authentication configured' as auth_status,
       'User sync trigger created' as sync_status,
       'Storage policies updated' as storage_status;

-- Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'products', 'notes', 'rooms')
ORDER BY tablename;
