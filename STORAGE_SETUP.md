# Storage Bucket Setup Guide

## Issue
The application is trying to create a storage bucket automatically, but the anonymous key doesn't have permission due to Row Level Security (RLS) policies.

## Solution: Manual Bucket Creation

### Step 1: Create the Bucket in Supabase Dashboard

1. Go to your Supabase Dashboard: https://mkpiczemojgcciooxejp.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **"New Bucket"**
4. Enter the following details:
   - **Bucket name**: `recovery-files`
   - **Public bucket**: **No** (uncheck this)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: `image/png`, `image/jpeg`, `application/pdf`
5. Click **"Save"**

### Step 2: Update RLS Policies (if needed)

The storage policies should already be set up in your database.sql file, but if you need to verify:

1. Go to **Storage** -> **Policies**
2. Ensure these policies exist for the `recovery-files` bucket:
   - `Users can upload recovery files` (INSERT)
   - `Users can read own recovery files` (SELECT)
   - `Users can update own recovery files` (UPDATE)
   - `Users can delete own recovery files` (DELETE)

### Step 3: Verify Setup

After creating the bucket, the application should work without the storage error. The bucket check will pass and file uploads should work properly.

## Alternative: Use Service Role Key

If you want automatic bucket creation, you would need to use the service role key instead of the anonymous key, but this is **not recommended** for client-side applications as it exposes admin privileges.

## Current Status

The application will now:
1. Detect when bucket creation fails due to RLS
2. Show a user-friendly message about manual setup
3. Attempt file uploads anyway (in case the bucket exists)

Once you create the bucket manually, the recovery form will work completely.
