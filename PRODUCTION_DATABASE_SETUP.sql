-- ============================================================================
-- STUDXCHANGE PRODUCTION DATABASE SETUP
-- This script adds proper authentication, RLS policies, and foreign key constraints
-- Run this AFTER the development setup is working
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD FOREIGN KEY CONSTRAINTS BACK
-- ============================================================================

-- Add foreign key constraint back to users table (links to auth.users)
-- Note: This will only work if users exist in both tables
ALTER TABLE public.users 
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints for seller_id fields
ALTER TABLE public.products 
ADD CONSTRAINT products_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notes 
ADD CONSTRAINT notes_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add other foreign key constraints
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
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_ratings 
ADD CONSTRAINT user_ratings_rated_user_id_fkey 
FOREIGN KEY (rated_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_ratings 
ADD CONSTRAINT user_ratings_rater_user_id_fkey 
FOREIGN KEY (rater_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Categories table can remain public (no RLS needed)
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: CREATE COMPREHENSIVE RLS POLICIES
-- ============================================================================

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Allow users to view all profiles (public information)
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Anyone can view products (public marketplace)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

-- Authenticated users can create products
CREATE POLICY "Authenticated users can create products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

-- Users can update their own products
CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Users can delete their own products
CREATE POLICY "Users can delete own products" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- ROOMS TABLE POLICIES
-- ============================================================================

-- Anyone can view rooms (public marketplace)
CREATE POLICY "Anyone can view rooms" ON public.rooms
    FOR SELECT USING (true);

-- Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

-- Users can update their own rooms
CREATE POLICY "Users can update own rooms" ON public.rooms
    FOR UPDATE USING (auth.uid() = seller_id);

-- Users can delete their own rooms
CREATE POLICY "Users can delete own rooms" ON public.rooms
    FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- NOTES TABLE POLICIES
-- ============================================================================

-- Anyone can view notes (public marketplace)
CREATE POLICY "Anyone can view notes" ON public.notes
    FOR SELECT USING (true);

-- Authenticated users can create notes
CREATE POLICY "Authenticated users can create notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

-- Users can update their own notes
CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = seller_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================================================

-- Users can view conversations they participate in
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Users can update conversations they participate in
CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
        )
    );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in own conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- System can create notifications (service_role)
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- WISHLIST TABLE POLICIES
-- ============================================================================

-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to own wishlist" ON public.wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can remove from own wishlist" ON public.wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================================

-- Anyone can view user profiles
CREATE POLICY "Anyone can view user profiles" ON public.user_profiles
    FOR SELECT USING (true);

-- Users can create their own profile
CREATE POLICY "Users can create own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- USER_RATINGS TABLE POLICIES
-- ============================================================================

-- Anyone can view ratings (public reviews)
CREATE POLICY "Anyone can view ratings" ON public.user_ratings
    FOR SELECT USING (true);

-- Authenticated users can create ratings
CREATE POLICY "Users can create ratings" ON public.user_ratings
    FOR INSERT WITH CHECK (auth.uid() = rater_user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON public.user_ratings
    FOR UPDATE USING (auth.uid() = rater_user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings" ON public.user_ratings
    FOR DELETE USING (auth.uid() = rater_user_id);

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Users can view transactions they're involved in
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Users can create transactions as buyers
CREATE POLICY "Users can create transactions as buyers" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- System can update transactions (for payment processing)
CREATE POLICY "System can update transactions" ON public.transactions
    FOR UPDATE USING (true);

-- ============================================================================
-- STEP 4: CREATE USER SYNC FUNCTION AND TRIGGER
-- ============================================================================

-- Function to automatically create a user profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 5: GRANT PROPER PERMISSIONS
-- ============================================================================

-- Revoke all permissions from anon (except what's needed)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Grant specific permissions to anon (for public viewing)
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT ON public.notes TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.user_ratings TO anon;

-- Grant full permissions to authenticated users (controlled by RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant full permissions to service_role (for admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

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
SELECT '🎉 Production setup completed!' as status;
SELECT '✅ Foreign key constraints added' as info;
SELECT '✅ RLS enabled with proper policies' as info;
SELECT '✅ User sync trigger created' as info;
SELECT '⚠️  Authentication is now REQUIRED for submissions' as warning;
