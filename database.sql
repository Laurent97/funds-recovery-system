-- Create recovery_requests table
CREATE TABLE IF NOT EXISTS recovery_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id VARCHAR(10) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  platform VARCHAR(255) NOT NULL,
  total_amount DECIMAL(20, 8) NOT NULL,
  fee_amount DECIMAL(20, 8) NOT NULL,
  net_amount DECIMAL(20, 8) NOT NULL,
  transaction_id VARCHAR(255),
  selected_address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  proof_file_url TEXT,
  payment_proof_url TEXT,
  id_upload_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add selected_address column to existing tables (if it doesn't exist)
ALTER TABLE recovery_requests ADD COLUMN IF NOT EXISTS selected_address VARCHAR(255);

-- Create bucket for recovery files (this will be created via Supabase dashboard or API)
-- The bucket creation is handled separately in Supabase's storage system

-- Set up Row Level Security
ALTER TABLE recovery_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert recovery requests" ON recovery_requests;
DROP POLICY IF EXISTS "Users can read own recovery requests" ON recovery_requests;
DROP POLICY IF EXISTS "Users can update own recovery requests" ON recovery_requests;

-- Policy for inserting recovery requests
CREATE POLICY "Users can insert recovery requests" ON recovery_requests
FOR INSERT WITH CHECK (true);

-- Policy for reading recovery requests
CREATE POLICY "Users can read own recovery requests" ON recovery_requests
FOR SELECT USING (true);

-- Policy for updating recovery requests
CREATE POLICY "Users can update own recovery requests" ON recovery_requests
FOR UPDATE USING (true);

-- Storage policies (for Supabase storage system)
-- These policies assume you have created a bucket named 'recovery-files' in Supabase Storage

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload recovery files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own recovery files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own recovery files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recovery files" ON storage.objects;

-- Policy for uploading files to recovery-files bucket
CREATE POLICY "Users can upload recovery files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'recovery-files');

-- Policy for reading files from recovery-files bucket  
CREATE POLICY "Users can read own recovery files" ON storage.objects
FOR SELECT USING (bucket_id = 'recovery-files');

-- Policy for updating files in recovery-files bucket
CREATE POLICY "Users can update own recovery files" ON storage.objects
FOR UPDATE USING (bucket_id = 'recovery-files');

-- Policy for deleting files from recovery-files bucket
CREATE POLICY "Users can delete own recovery files" ON storage.objects
FOR DELETE USING (bucket_id = 'recovery-files');

-- Index for better performance
DROP INDEX IF EXISTS idx_recovery_requests_request_id;
DROP INDEX IF EXISTS idx_recovery_requests_email;
DROP INDEX IF EXISTS idx_recovery_requests_status;

CREATE INDEX idx_recovery_requests_request_id ON recovery_requests(request_id);
CREATE INDEX idx_recovery_requests_email ON recovery_requests(email);
CREATE INDEX idx_recovery_requests_status ON recovery_requests(status);
