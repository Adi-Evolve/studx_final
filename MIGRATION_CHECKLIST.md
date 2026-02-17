# 🚀 Quick Migration Checklist

## ⏰ Time Required: ~2 hours

### Step 1: Export Current Data (10 minutes)
```bash
# Install dependencies if needed
npm install dotenv

# Export your current data
node export_data.js
```
**Result**: Creates `supabase_export_[timestamp].json` and `new_database_schema.sql`

### Step 2: Create New Supabase Account (15 minutes)
1. **Option A**: Use new email address
   - Create new Gmail/Outlook account
   - Sign up at https://supabase.com
   
2. **Option B**: Use different GitHub account  
   - Create new GitHub account
   - Sign up at Supabase with GitHub OAuth

3. **Create new project**
   - Choose a region (same as current for better performance)
   - Copy the new URL and keys

### Step 3: Set Up New Database (20 minutes)
1. **Go to SQL Editor** in new Supabase project
2. **Copy and paste** the content from `new_database_schema.sql`
3. **Run the script** to create all tables and policies
4. **Create storage buckets**:
   - Go to Storage section
   - Create buckets: `product_pdfs`, `product_images`, `avatars`
   - Set them as public

### Step 4: Update Environment Variables (5 minutes)
**Backup your current .env.local first!**

```bash
# Copy current file
cp .env.local .env.local.backup

# Update with new credentials
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SECRET_KEY=your-new-secret-key
```

### Step 5: Import Data (15 minutes)
```bash
# Import your data to new project
node import_data.js
```

### Step 6: Test Everything (30 minutes)
```bash
# Start your development server
npm run dev
```

**Test checklist**:
- [ ] Homepage loads
- [ ] User authentication works
- [ ] Search functionality works
- [ ] Can create new listings
- [ ] Payment system works
- [ ] All existing users can log in

### Step 7: Handle Storage Files (30 minutes)
If you have uploaded files (PDFs, images):

1. **Download from old storage**:
   - Go to old Supabase project → Storage
   - Download all files from each bucket

2. **Upload to new storage**:
   - Go to new Supabase project → Storage  
   - Upload files to corresponding buckets
   - Update any hardcoded URLs in your app

### Step 8: Go Live (15 minutes)
1. **Deploy updated app** with new environment variables
2. **Update any external services** that use webhooks
3. **Monitor for issues**

## 🚨 Emergency Rollback Plan
If something goes wrong:
```bash
# Restore original environment variables
cp .env.local.backup .env.local

# Restart your app
npm run dev
```

## 📞 Need Help?
If you get stuck at any step:
1. Check error messages carefully
2. Verify environment variables are correct
3. Ensure database schema was created properly
4. Test with a simple query in Supabase dashboard

## 🎯 Success Criteria
- [ ] App loads without errors
- [ ] All existing functionality works
- [ ] New Supabase dashboard shows your data
- [ ] Users can log in and create listings
- [ ] No quota exceeded warnings

## 💡 Pro Tips
- **Do this during low-traffic hours**
- **Backup everything before starting**
- **Test each step before proceeding**
- **Keep old project for 1 week as backup**

## After Migration
1. **Monitor usage** in new Supabase dashboard
2. **Implement optimizations** to avoid hitting limits again
3. **Consider upgrading** if usage grows significantly
4. **Set up alerts** for approaching quotas

Ready to start? Run: `node export_data.js`
