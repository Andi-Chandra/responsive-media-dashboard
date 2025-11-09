# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account and project created
- Docker (optional, for containerized development)

## 1. Clone and Setup Repository

```bash
git clone <repository-url>
cd responsive-media-dashboard
npm install
```

## 2. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Run Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Execute the SQL script

### Configure Authentication
1. Go to Supabase Dashboard → Authentication → Settings
2. Disable "Enable email confirmations"
3. Add your site URL to "Site URL" and "Redirect URLs"
4. Under "User Management", disable "Enable email signups"

### Setup Storage Buckets
The migration script creates storage buckets automatically. Verify them in:
Supabase Dashboard → Storage

## 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these values from:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Dashboard → Settings → API → URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Dashboard → Settings → API → anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Settings → API → service_role key (keep secret!)

## 4. Create First Admin User

### Method 1: Using Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Enter email and temporary password
4. Go to Table Editor → Profiles
5. Find the user and set `role` to 'admin'

### Method 2: Using SQL
Run this in Supabase SQL Editor:

```sql
-- Insert admin user (replace with actual email)
INSERT INTO auth.users (
  instance_id,
  email,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  app_metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- your instance_id
  'admin@example.com',
  now(),
  NULL,
  NULL,
  '{"role": "admin", "full_name": "Admin User"}',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'
);

-- The trigger will automatically create the profile with admin role
```

## 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 6. Access Admin Dashboard

1. Navigate to `http://localhost:3000/dashboard`
2. You'll be redirected to the sign-in page
3. Sign in with your admin credentials
4. You'll have access to the admin dashboard

## Docker Setup (Optional)

### Build and Run with Docker

```bash
# Build the image
docker build -t responsive-media-dashboard .

# Run with docker-compose
docker-compose up
```

### Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    env_file:
      - .env.local
    volumes:
      - .:/app
      - /app/node_modules
```

## 7. Verify Setup

### Public Pages
- Home: `http://localhost:3000` - Should show header navigation
- Gallery: `http://localhost:3000/gallery` - Should show gallery grid
- Video: `http://localhost:3000/video` - Should show video section
- VTC KKP: `http://localhost:3000/vtc-kkp` - Should show iframe
- Dashboard PNBP: `http://localhost:3000/dashboard-pnbp` - Should show iframe

### Admin Dashboard
- Sign in: `http://localhost:3000/sign-in`
- Dashboard: `http://localhost:3000/dashboard`
- Slider Management: `http://localhost:3000/dashboard/slider`
- Gallery Management: `http://localhost:3000/dashboard/gallery`
- Video Management: `http://localhost:3000/dashboard/videos`
- User Management: `http://localhost:3000/dashboard/users`

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Verify environment variables are correct
   - Check Supabase Auth settings
   - Ensure email confirmations are disabled

2. **Database connection errors**
   - Verify Supabase URL and keys
   - Check if migrations ran successfully
   - Ensure RLS policies are properly configured

3. **File upload not working**
   - Check storage bucket policies
   - Verify user has admin role
   - Check file size limits

4. **Iframe not loading**
   - Check if external sites allow iframe embedding
   - Verify console for CORS/X-Frame-Options errors

### Debug Mode

Add to your `.env.local`:
```env
DEBUG=supabase:*
```

### Logs and Monitoring

Check Supabase Dashboard:
- Authentication logs
- Database query logs
- Storage usage

## Production Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Required Environment Variables in Production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your deployed URL)

### Post-Deployment Checks

1. Test all public pages load correctly
2. Verify admin authentication works
3. Test file upload functionality
4. Check iframes load external content
5. Verify responsive design on mobile devices