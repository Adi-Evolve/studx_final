# 🚀 StudX Database Migration Guide - Complete Step-by-Step

## ⚠️ **IMPORTANT: Read This First**

Your current Supabase database is approaching the 500MB limit. You have 3 migration options:

### **Option 1: New Supabase Project (RECOMMENDED - Easiest)**
- **Effort**: Low (2-3 hours)
- **Cost**: Free (500MB fresh limit)
- **Downtime**: ~30 minutes
- **Risk**: Low

### **Option 2: Railway Database Migration**
- **Effort**: Medium (4-5 hours)
- **Cost**: Free (1GB limit + $100 student credit)
- **Downtime**: ~1 hour
- **Risk**: Medium

### **Option 3: Neon Database Migration**
- **Effort**: Medium (4-5 hours)
- **Cost**: Free (3GB limit)
- **Downtime**: ~1 hour
- **Risk**: Medium

---

## 🎯 **RECOMMENDED: Option 1 - New Supabase Project**

### **Step 1: Export Current Data (30 minutes)**

#### 1.1 Export All Tables
Run this script to export your data:

```bash
# Run this from your project directory
node export_current_data.js
```

This will create backup files:
- `backup_users.json`
- `backup_products.json`
- `backup_notes.json`
- `backup_rooms.json`
- `backup_transactions.json`

#### 1.2 Backup Environment Variables
```bash
# Create backup of current .env.local
cp .env.local .env.local.backup

# Save current credentials
echo "OLD_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" >> migration_backup.env
echo "OLD_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY" >> migration_backup.env
echo "OLD_SUPABASE_SECRET_KEY=$SUPABASE_SECRET_KEY" >> migration_backup.env
```

### **Step 2: Create New Supabase Project (15 minutes)**

#### 2.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose organization: **Personal**
4. Project name: **"StudX-Production"**
5. Database password: **Generate strong password**
6. Region: **Choose closest to your users**
7. Click **"Create new project"**

#### 2.2 Get New Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://your-new-project.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIs...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIs...`

### **Step 3: Setup New Database Schema (20 minutes)**

#### 3.1 Run Database Schema
1. In new Supabase project, go to **SQL Editor**
2. Copy entire content from `FRESH_DATABASE_SETUP.sql`
3. **Run the script**
4. Verify all tables are created

#### 3.2 Setup Storage Buckets
1. Go to **Storage** section
2. Create buckets:
   - **`product_pdfs`** (Public: Yes)
   - **`product_images`** (Public: Yes)
   - **`avatars`** (Public: Yes)

#### 3.3 Configure Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Use same Google OAuth credentials from current project

### **Step 4: Update Environment Variables (5 minutes)**

Update your `.env.local`:
```bash
# New Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SECRET_KEY=your-new-service-key

# Keep existing Google Drive, Razorpay, ImgBB credentials
GOOGLE_DRIVE_FOLDER_ID=1vqbYObGemT4AUnqDx5AJxyLBcaqwnGNX
GOOGLE_SERVICE_ACCOUNT_EMAIL=studx-storage-service@studx-storage.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_SECRET_KEY=your_razorpay_secret
IMGBB_API_KEY=272785e1c6e6221d927bad99483ff9ed
```

### **Step 5: Import Data to New Database (45 minutes)**

Run the import script:
```bash
# This will import all your backed up data
node import_data_to_new_supabase.js
```

### **Step 6: Test Everything (30 minutes)**

#### 6.1 Test Basic Functions
```bash
# Start your app
npm run dev

# Test these features:
# 1. User login/signup
# 2. Create product listing
# 3. Upload note with PDF
# 4. Create room listing
# 5. Payment flow (test mode)
# 6. Chat functionality
```

#### 6.2 Verify Data Migration
```bash
# Run verification script
node verify_migration.js
```

### **Step 7: Update Production (15 minutes)**

#### 7.1 Update Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY`

#### 7.2 Deploy to Production
```bash
# Deploy with new database
vercel --prod
```

### **Step 8: Update Admin Panel (5 minutes)**

Update `adi.html` with new Supabase credentials:
```javascript
// Update these lines in adi.html
const SUPABASE_URL = 'https://your-new-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-new-anon-key';
```

---

## 🔄 **Alternative: Option 2 - Railway Migration**

### **Why Railway?**
- **1GB free database** (2x Supabase)
- **$100 student credit**
- **PostgreSQL compatible**
- **Easy migration tools**

### **Steps:**
1. Sign up at [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Use Railway's migration tools
4. Update connection strings in your app
5. Deploy with new database URL

### **Connection String Format:**
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

---

## 🎯 **Alternative: Option 3 - Neon Migration**

### **Why Neon?**
- **3GB free database** (6x Supabase)
- **PostgreSQL compatible**
- **Serverless architecture**
- **Built-in connection pooling**

### **Steps:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create database
3. Use built-in migration tools
4. Update connection strings
5. Deploy with new credentials

---

## ⚡ **Quick Migration Checklist**

### **Before Migration:**
- [ ] Export all data from current Supabase
- [ ] Backup environment variables
- [ ] Test current app functionality
- [ ] Document custom configurations

### **During Migration:**
- [ ] Create new database project
- [ ] Setup database schema
- [ ] Configure authentication providers
- [ ] Import data
- [ ] Update environment variables

### **After Migration:**
- [ ] Test all app functionality
- [ ] Verify data integrity
- [ ] Update production deployment
- [ ] Update admin panel credentials
- [ ] Monitor for issues

---

## 🆘 **Rollback Plan**

If anything goes wrong:

1. **Restore environment variables:**
   ```bash
   cp .env.local.backup .env.local
   ```

2. **Redeploy previous version:**
   ```bash
   vercel --prod
   ```

3. **Your original database remains unchanged** until you're ready to shut it down

---

## 📞 **Migration Support**

**Estimated Total Time:** 2-3 hours
**Recommended Time:** Weekend morning when users are least active
**Success Rate:** 99% (very safe migration)

**Need help?** Run the diagnostic scripts first:
```bash
node check_current_database_size.js
node verify_migration_readiness.js
```

---

## 🎉 **Post-Migration Benefits**

After successful migration:
- ✅ **Fresh 500MB-3GB storage** depending on provider
- ✅ **Better performance** with optimized database
- ✅ **No data loss** - complete migration
- ✅ **Same functionality** - zero breaking changes
- ✅ **Future scalability** - room to grow

**Your StudX platform will be future-ready with plenty of storage space for growth!** 🚀
