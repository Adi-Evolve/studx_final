-- ============================================================================
-- PRODUCTION READY DATABASE SETUP
-- This script enables authentication, RLS policies, and foreign key constraints
-- Run this after the development database is working
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add foreign key constraint to users table (references auth.users)
ALTER TABLE public.users 
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to products table
ALTER TABLE public.products 
ADD CONSTRAINT products_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to notes table
ALTER TABLE public.notes 
ADD CONSTRAINT notes_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to rooms table
ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to other tables
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_participant1_id_fkey 
FOREIGN KEY (participant1_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_participant2_id_fkey 
FOREIGN KEY (participant2_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.wishlist 
ADD CONSTRAINT wishlist_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_ratings 
ADD CONSTRAINT user_ratings_rated_user_id_fkey 
FOREIGN KEY (rated_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_ratings 
ADD CONSTRAINT user_ratings_rater_user_id_fkey 
FOREIGN KEY (rater_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ============================================================================

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

-- Categories table remains open for reading
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: CREATE RLS POLICIES
-- ============================================================================

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Allow users to view all profiles (for marketplace functionality)
CREATE POLICY "users_select_all" ON public.users
    FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "users_delete_own" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Allow everyone to view products
CREATE POLICY "products_select_all" ON public.products
    FOR SELECT USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "products_insert_auth" ON public.products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

-- Allow users to update their own products
CREATE POLICY "products_update_own" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Allow users to delete their own products
CREATE POLICY "products_delete_own" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- NOTES TABLE POLICIES
-- ============================================================================

-- Allow everyone to view notes
CREATE POLICY "notes_select_all" ON public.notes
    FOR SELECT USING (true);

-- Allow authenticated users to insert notes
CREATE POLICY "notes_insert_auth" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

-- Allow users to update their own notes
CREATE POLICY "notes_update_own" ON public.notes
    FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Allow users to delete their own notes
CREATE POLICY "notes_delete_own" ON public.notes
    FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- ROOMS TABLE POLICIES
-- ============================================================================

-- Allow everyone to view rooms
CREATE POLICY "rooms_select_all" ON public.rooms
    FOR SELECT USING (true);

-- Allow authenticated users to insert rooms
CREATE POLICY "rooms_insert_auth" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

-- Allow users to update their own rooms
CREATE POLICY "rooms_update_own" ON public.rooms
    FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Allow users to delete their own rooms
CREATE POLICY "rooms_delete_own" ON public.rooms
    FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================================================

-- Allow users to view conversations they are part of
CREATE POLICY "conversations_select_participant" ON public.conversations
    FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Allow users to create conversations
CREATE POLICY "conversations_insert_auth" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = participant1_id OR auth.uid() = participant2_id));

-- Allow participants to update conversations
CREATE POLICY "conversations_update_participant" ON public.conversations
    FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Allow users to view messages in conversations they are part of
CREATE POLICY "messages_select_participant" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
        )
    );

-- Allow users to insert messages in conversations they are part of
CREATE POLICY "messages_insert_participant" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
        )
    );

-- Allow users to update their own messages
CREATE POLICY "messages_update_own" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Allow users to view their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Allow system to insert notifications (service role)
CREATE POLICY "notifications_insert_system" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own notifications
CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- WISHLIST TABLE POLICIES
-- ============================================================================

-- Allow users to view their own wishlist
CREATE POLICY "wishlist_select_own" ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to add to their wishlist
CREATE POLICY "wishlist_insert_own" ON public.wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to remove from their wishlist
CREATE POLICY "wishlist_delete_own" ON public.wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================================

-- Allow everyone to view profiles
CREATE POLICY "user_profiles_select_all" ON public.user_profiles
    FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- USER_RATINGS TABLE POLICIES
-- ============================================================================

-- Allow everyone to view ratings
CREATE POLICY "user_ratings_select_all" ON public.user_ratings
    FOR SELECT USING (true);

-- Allow authenticated users to insert ratings
CREATE POLICY "user_ratings_insert_auth" ON public.user_ratings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = rater_user_id);

-- Allow users to update their own ratings
CREATE POLICY "user_ratings_update_own" ON public.user_ratings
    FOR UPDATE USING (auth.uid() = rater_user_id);

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Allow users to view transactions they are involved in
CREATE POLICY "transactions_select_involved" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Allow system to insert transactions
CREATE POLICY "transactions_insert_system" ON public.transactions
    FOR INSERT WITH CHECK (true);

-- Allow system to update transactions
CREATE POLICY "transactions_update_system" ON public.transactions
    FOR UPDATE USING (true);

-- ============================================================================
-- SPONSORSHIP_SEQUENCES TABLE POLICIES
-- ============================================================================

-- Allow everyone to view sponsorship sequences
CREATE POLICY "sponsorship_sequences_select_all" ON public.sponsorship_sequences
    FOR SELECT USING (true);

-- Allow system to manage sponsorship sequences
CREATE POLICY "sponsorship_sequences_insert_system" ON public.sponsorship_sequences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "sponsorship_sequences_update_system" ON public.sponsorship_sequences
    FOR UPDATE USING (true);

CREATE POLICY "sponsorship_sequences_delete_system" ON public.sponsorship_sequences
    FOR DELETE USING (true);

-- ============================================================================
-- STEP 4: CREATE USER SYNC FUNCTION AND TRIGGER
-- ============================================================================

-- Function to sync user data from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        email = NEW.email,
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user sync
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 5: GRANT PROPER PERMISSIONS
-- ============================================================================

-- Revoke excessive permissions from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant specific permissions to anon (for public reading)
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.notes TO anon;
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.user_ratings TO anon;
GRANT SELECT ON public.sponsorship_sequences TO anon;

-- Grant full access to authenticated users (controlled by RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Keep service_role permissions for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 6: VERIFICATION
-- ============================================================================

-- Check foreign key constraints
SELECT 'Foreign Key Constraints:' as check_type;
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check RLS status
SELECT 'RLS Status:' as check_type;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check policies
SELECT 'RLS Policies:' as check_type;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
SELECT '🎉 Production database setup completed!' as status;
SELECT '✅ Foreign key constraints added' as info;
SELECT '✅ RLS enabled with proper policies' as info;
SELECT '✅ User sync function created' as info;
SELECT '✅ Permissions properly configured' as info;
SELECT '⚠️  Remember to update your API code to require authentication' as warning;
