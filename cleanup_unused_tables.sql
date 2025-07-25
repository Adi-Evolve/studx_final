-- Database Cleanup: Remove Unused and Redundant Tables
-- ⚠️  BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT!

-- First, let's check what tables currently exist
SELECT 'Current tables in database:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ===== STEP 1: REMOVE ADMIN-RELATED TABLES =====
-- These are not used in the main application

DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;

-- ===== STEP 2: REMOVE REDUNDANT USER/PROFILE TABLES =====
-- profiles table is redundant with users table

DROP TABLE IF EXISTS public.profiles CASCADE;

-- ===== STEP 3: REMOVE UNUSED FEATURE TABLES =====
-- These features are not implemented or used

DROP TABLE IF EXISTS public.rating_helpfulness CASCADE;
DROP TABLE IF EXISTS public.search_suggestions CASCADE;
DROP TABLE IF EXISTS public.sponsorship_sequences CASCADE;
DROP TABLE IF EXISTS public.bulk_upload_sessions CASCADE;

-- ===== STEP 4: REMOVE REDUNDANT PRODUCT TABLES =====
-- regular_products table is redundant with products table

DROP TABLE IF EXISTS public.regular_products CASCADE;

-- ===== STEP 5: CONSOLIDATE REVIEW SYSTEMS =====
-- Keep user_ratings, remove duplicate reviews tables

DROP TABLE IF EXISTS public.review_rooms CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;

-- ===== STEP 6: VERIFY FINAL TABLE LIST =====
SELECT 'Tables remaining after cleanup:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ===== EXPECTED REMAINING TABLES =====
/*
After cleanup, you should have these tables:

Core Tables:
- users
- products  
- notes
- rooms
- categories

Feature Tables:
- user_profiles
- user_ratings
- wishlist
- conversations
- messages
- notifications

These tables are actually used by your application components.
*/

-- ===== VERIFICATION QUERIES =====
-- Run these to ensure core functionality still works

-- Check products table
SELECT 'Products table check:' as test;
SELECT COUNT(*) as total_products FROM public.products;

-- Check notes table  
SELECT 'Notes table check:' as test;
SELECT COUNT(*) as total_notes FROM public.notes;

-- Check rooms table
SELECT 'Rooms table check:' as test;  
SELECT COUNT(*) as total_rooms FROM public.rooms;

-- Check users table
SELECT 'Users table check:' as test;
SELECT COUNT(*) as total_users FROM public.users;

SELECT 'Database cleanup completed successfully!' as status;
