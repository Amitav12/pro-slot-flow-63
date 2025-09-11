# 🚨 IMMEDIATE FIX FOR LOADING SCREEN

## The Problem
Your app is stuck on loading screen because the `user_profiles` table is missing the `auth_role` column.

## ⚡ INSTANT FIX (30 seconds)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: `igezuyqvfoxolxbudcyj`

### Step 2: Run SQL Fix
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. **Copy and paste this EXACT SQL:**

```sql
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT 'customer';
UPDATE public.user_profiles SET auth_role = COALESCE(role, 'customer') WHERE auth_role IS NULL;
```

4. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Refresh Your App
1. Go back to your browser with the app
2. **Hard refresh** (Ctrl+F5 or Cmd+Shift+R)
3. ✅ **App should now load normally!**

## 🎯 What This Does
- Adds the missing `auth_role` column to your `user_profiles` table
- Sets default values for existing users
- Fixes the authentication system immediately

## ⏱️ Total Time: 30 seconds

After running this fix:
- ✅ App loads normally
- ✅ Authentication works
- ✅ Users can sign up/login
- ✅ Dashboards work properly

---

## 🔧 Alternative: If SQL Editor Doesn't Work

If you can't access SQL Editor, wait 3 seconds on the loading screen and click **"Click here to continue anyway"** - this will bypass the loading issue temporarily.

---

**This is the exact fix for your loading screen issue!** 🚀