# Backend Structure Document: responsive-media-dashboard

## 1. Backend Architecture

Our backend is built to be simple, scalable, and easy to maintain. Here’s how it’s put together:

- **Next.js App Router**: Handles server-side rendering and file-based routing. We use Server Actions for secure, server-side operations like file uploads and database writes.
- **TypeScript**: Provides type safety throughout the codebase, reducing bugs and making refactoring easier.
- **Supabase (BaaS)**: Acts as our backend service. It handles:
  - **Authentication** with Supabase Auth;
  - **PostgreSQL database** for metadata;
  - **Storage** for hosting images and videos.
- **Docker (local dev)**: Ensures everyone on the team has a consistent development environment.

This setup supports:

- **Scalability**: Vercel’s serverless platform automatically scales Next.js functions, while Supabase scales the database and storage as needed.
- **Maintainability**: Clear separation of concerns—Next.js handles routing/UI, Supabase handles data and auth—makes it easy to update or swap components later.
- **Performance**: Server-side rendering and edge caching (via Vercel) deliver pages quickly, and Supabase’s hosted services are optimized for low-latency data access.

## 2. Database Management

We rely on Supabase’s hosted PostgreSQL for all structured data, plus Supabase Storage for media files.

- **PostgreSQL (SQL)**
  - Stores metadata about slider images, gallery photos, and videos.
  - Uses Row Level Security (RLS) to control who can read or modify data.
- **Supabase Storage**
  - Hosts the actual image and video files.
  - Provides public URLs for display on the site.
- **Data Access**
  - All queries and mutations go through the Supabase JavaScript client (`@supabase/supabase-js`).
  - On the server, Next.js Server Actions call Supabase directly using environment-protected keys.
  - On public pages, we fetch data in Server Components or via `@supabase/ssr` helpers for fast, secure data retrieval.

## 3. Database Schema

Below is a human-friendly description followed by the SQL schema you can run in the Supabase SQL editor.

**Human-Readable Schema**

1. **slider_images**: Holds homepage carousel details.
   - `id`: Unique identifier (UUID).
   - `created_at`: Timestamp when added.
   - `image_url`: Link to the stored image.
   - `title`/`description`: Optional text for the slide.
   - `display_order`: Position in the carousel.

2. **gallery_images**: Stores photos for the gallery page.
   - Similar fields to slider_images, plus `category` for grouping.

3. **videos**: Contains video entries for the video page.
   - `video_url`: YouTube embed or Storage link.
   - `thumbnail_url`: Image shown before playing.
   - `title`/`description`: Metadata text.

**SQL Schema**
```sql
-- Table: slider_images
CREATE TABLE slider_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INT DEFAULT 0
);

-- Table: gallery_images
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT
);

-- Table: videos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT NOT NULL,
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read" ON slider_images FOR SELECT USING (true);
CREATE POLICY "public_read" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "public_read" ON videos FOR SELECT USING (true);

-- Admin full access (authenticated users)
CREATE POLICY "admin_manage" ON slider_images FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_manage" ON gallery_images FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_manage" ON videos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```  

## 4. API Design and Endpoints

We follow a RESTful pattern using Next.js Server Actions and API routes where needed. All data operations go through Supabase functions.

Key actions:

- **Public Data Fetching**
  - Home page: fetches `slider_images`
  - Gallery page: fetches `gallery_images`
  - Video page: fetches `videos`
  - Implemented directly in Server Components or with `@supabase/ssr`.

- **Admin Operations (Server Actions)**
  - `addSliderImage(formData)`
  - `updateSliderImage(id, formData)`
  - `deleteSliderImage(id)`
  - (Similarly for gallery and videos.)
  - Each action:
    1. Uploads file to Supabase Storage.
    2. Gets public URL.
    3. Inserts/updates/deletes the corresponding database record.

- **Authentication Endpoints**
  - Handled by Supabase Auth via client library.
  - Sign-in page (`/sign-in`) uses `supabase.auth.signInWithPassword()`.
  - Session checks in `/dashboard/layout` ensure only logged-in admins can access protected routes.

## 5. Hosting Solutions

- **Vercel (Next.js)**
  - Deploys the frontend and serverless functions globally.
  - Automatically handles SSL, load balancing, and scaling.
- **Supabase**
  - Fully managed PostgreSQL and object storage.
  - Built-in Auth service.

This combination offers:

- **Reliability**: Both platforms guarantee high uptime.
- **Scalability**: Serverless and managed services scale with demand.
- **Cost-Effectiveness**: Pay-as-you-go pricing, free tiers for small workloads.

## 6. Infrastructure Components

- **Load Balancers & Edge Network**
  - Vercel’s global edge automatically routes users to the nearest server.
- **Caching**
  - Static assets (JS, CSS, images) are cached at the edge.
  - ISR (Incremental Static Regeneration) can be enabled for cacheable pages.
- **CDN**
  - Vercel’s built-in CDN serves all static and pre-rendered content.
- **Containerization**
  - Docker and `docker-compose` for local database and environment replication.

All components work together to deliver fast, reliable pages and APIs.

## 7. Security Measures

- **Authentication**: Supabase Auth with secure password flow; admin-only sign-in.
- **Authorization**: Row Level Security policies restrict data writes to authenticated users.
- **Data Encryption**:
  - TLS for all traffic (Vercel & Supabase endpoints).
  - Encryption at rest on Supabase storage and database.
- **Environment Variables**
  - Supabase keys and other secrets stored in Vercel’s dashboard, never in source code.
- **Server-Side Actions**
  - All data mutations (inserts, updates, deletes) happen on the server to prevent tampering.

## 8. Monitoring and Maintenance

- **Logging & Metrics**
  - Supabase dashboard provides query and error logs.
  - Vercel Analytics tracks page performance and error rates.
- **Alerts**
  - Set up email or Slack notifications for deployment failures and runtime errors.
- **Backups & Updates**
  - Supabase offers automated database backups.
  - Regular dependency updates (Next.js, Supabase libs) and security patching.
- **Health Checks**
  - Simple uptime checks (e.g., ping home route) to ensure the site is live.

## 9. Conclusion and Overall Backend Summary

This backend is designed to be robust yet easy to understand:

- **Next.js** handles routing and server-side logic.
- **Supabase** manages authentication, database, and file storage.
- **Vercel** delivers a fast, scalable hosting environment.

By using Server Actions, RLS, and edge caching, we ensure both security and performance. The clear separation between public and admin areas, combined with a straightforward schema and secure defaults, aligns perfectly with the project’s goal of a responsive media site plus a locked-down content management dashboard.