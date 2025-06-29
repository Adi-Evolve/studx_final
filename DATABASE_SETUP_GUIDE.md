# 🚀 StudXchange Database Setup Guide

## ⚠️ IMPORTANT: Complete Database Reset Required

The error you encountered indicates that your current database schema doesn't match what the application expects. Follow these steps to fix it completely:

## 📋 Step-by-Step Instructions

### Step 1: Backup Current Data (Optional)
If you have important data, export it first:
```sql
-- Export existing data (run in Supabase SQL Editor)
COPY (SELECT * FROM public.notes) TO '/tmp/notes_backup.csv' CSV HEADER;
COPY (SELECT * FROM public.products) TO '/tmp/products_backup.csv' CSV HEADER;
COPY (SELECT * FROM public.rooms) TO '/tmp/rooms_backup.csv' CSV HEADER;
```

### Step 2: Drop Existing Tables (if needed)
⚠️ **WARNING: This will delete all data!**
```sql
-- Only run if you want to start fresh
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.bulk_upload_sessions CASCADE;
DROP TABLE IF EXISTS public.search_suggestions CASCADE;
```

### Step 3: Run Complete Schema
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the entire content from `complete_database_schema.sql`
4. Click **Run**

### Step 4: Verify Schema
Run this verification query:
```sql
-- Check if all tables exist with correct columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('notes', 'products', 'rooms', 'users')
ORDER BY table_name, ordinal_position;
```

### Step 5: Test Notes Upload
1. Go to your app's sell page
2. Try uploading a note with:
   - Title
   - College
   - Academic Year
   - Subject
   - Price
   - Images
   - PDF file
   - Description

## 🔍 What Was Fixed

### Database Schema Issues:
- ✅ **Consistent Column Names**: All tables now use `images` (not `image_urls`)
- ✅ **Correct PDF Storage**: Notes table has `pdfUrl` TEXT field
- ✅ **Proper Table Names**: API uses correct table names (`products`, `notes`, `rooms`)
- ✅ **Field Mapping**: All form fields map correctly to database columns

### API Route Fixes:
- ✅ **Table Name**: Fixed `product` → `products`
- ✅ **Column Names**: Consistent `images`, `pdfUrl`, `academic_year`
- ✅ **Error Handling**: Proper JSON responses
- ✅ **Field Validation**: Correct form field mapping

### Storage Setup:
- ✅ **Buckets**: `product_pdfs` and `product_images` buckets created
- ✅ **Policies**: Proper RLS policies for storage access
- ✅ **PDF Handling**: Signed URL generation for secure downloads

## 🎯 Expected Results

After running the complete schema:

1. **Notes Upload**: ✅ Should work without JSON errors
2. **PDF Download**: ✅ Should generate signed URLs properly  
3. **Image Display**: ✅ Should show preview images correctly
4. **Data Consistency**: ✅ All tables use consistent column names

## 🔧 Troubleshooting

If you still get errors:

1. **Check Console Logs**: Look for specific database errors
2. **Verify Columns**: Run the verification query above
3. **Test API Endpoint**: Check network tab for API response
4. **Check RLS Policies**: Ensure user has proper permissions

## 📞 Need Help?

If you encounter any issues:
1. Copy the exact error message
2. Run the verification query and share results
3. Check browser console for additional errors

The schema is now complete and should handle all StudXchange features perfectly!
