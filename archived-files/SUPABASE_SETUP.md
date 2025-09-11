# 🚀 Supabase Database Setup Guide

## ❌ Current Issue
Your Supabase project `igezuyqvfoxolxbudcyj` is not accessible. This usually means:
- Project was paused due to inactivity
- Project was deleted
- Wrong project credentials

## ✅ Solution: Set Up New Supabase Project

### Step 1: Create New Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: `pro-slot-flow`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
5. Click **"Create new project"**
6. Wait for project to be created (2-3 minutes)

### Step 2: Get New Project Credentials
1. In your new project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Project Reference ID** (the part before `.supabase.co`)
   - **anon public key** (long JWT token)

### Step 3: Update Your Project Configuration

#### Update `.env` file:
```env
VITE_SUPABASE_PROJECT_ID="your-new-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key"
VITE_SUPABASE_URL="https://your-new-project-id.supabase.co"
```

#### Update `src/integrations/supabase/client.ts`:
```typescript
const SUPABASE_URL = "https://your-new-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-new-anon-key";
```

#### Update `supabase/config.toml`:
```toml
project_id = "your-new-project-id"
```

### Step 4: Set Up Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `setup-database.sql`
4. Paste into the SQL editor
5. Click **"Run"** to execute

### Step 5: Verify Setup
Run the test script:
```bash
node test-db-connection.js
```

You should see:
```
✅ Database connection successful!
✅ Table 'categories' - OK
✅ Table 'subcategories' - OK
✅ Found 5 sample categories
```

### Step 6: Test Your App
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to `/dev-admin` or `/admin`
3. Try creating a new category - it should work!

## 🔧 Alternative: Reactivate Existing Project

If you want to keep the same project ID:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Look for your project `igezuyqvfoxolxbudcyj`
3. If it shows as "Paused", click **"Restore"**
4. If you don't see it, it may have been deleted - create a new one

## 🎯 Quick Test Commands

After setup, test these URLs in your browser:
- `http://localhost:5173/dev-admin` - Development admin access
- `http://localhost:5173/admin` - Direct admin dashboard

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all credentials are correct
3. Make sure the SQL script ran without errors
4. Test the database connection with the test script

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use different credentials for production
- The current setup bypasses auth in development mode only