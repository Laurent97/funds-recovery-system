# Kryvex TRADING Funds Recovery System

A modern React application for processing cryptocurrency fund recovery requests with Supabase backend integration.

## Features

- **Multi-step form** for fund recovery requests
- **File upload** support (proof of funds, payment proof, KYC documents)
- **Supabase integration** for data persistence and file storage
- **Admin dashboard** for managing recovery requests
- **Real-time status updates**
- **Responsive design** with modern UI/UX
- **Toast notifications** for user feedback

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Storage)
- **State Management**: React Query, React Hooks
- **Routing**: React Router DOM

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `database.sql` in your Supabase SQL Editor
3. Update the Supabase configuration in `src/lib/supabase.ts` with your project URL and anon key:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Start Development Server

```bash
pnpm run dev
```

The app will be available at `http://localhost:8080`

## Application Structure

### Main Application (`/`)
- **Kryvex TRADING Recovery System**: Multi-step form for submitting fund recovery requests
- Steps: Wallet Info, Proof of Funds, Fee Calculation, Payment, Confirmation

### Admin Dashboard (`/admin`)
- View all recovery requests
- Manage request statuses (pending, verified, approved, rejected)
- Download uploaded files
- Real-time updates

## Database Schema

### recovery_requests Table
- Stores all recovery request data
- Tracks status through workflow stages
- Links to uploaded files in Supabase Storage

### Storage Bucket
- `recovery-files`: Stores proof documents, payment proofs, and KYC files
- Organized by request ID for easy access

## File Upload Support

- **Accepted formats**: PNG, JPG, PDF
- **Maximum file size**: 10 MB per file
- **Files stored**: Proof of funds, Payment proof, KYC/ID documents

## Security Features

- Row Level Security (RLS) enabled on database tables
- Secure file storage with access controls
- Input validation and sanitization
- SSL encryption for all communications

## Development

### Build for Production

```bash
pnpm run build
```

### Preview Production Build

```bash
pnpm run preview
```

### Linting

```bash
pnpm run lint
```

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

The app is configured for deployment on Vercel (see `vercel.json`). Simply connect your repository to Vercel and deploy.

## Support

For issues and questions:
1. Check the browser console for error messages
2. Verify Supabase connection and permissions
3. Ensure all environment variables are set correctly

## License

This project is proprietary and confidential.
