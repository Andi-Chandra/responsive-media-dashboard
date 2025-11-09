# Project Requirements Document (PRD)

## 1. Project Overview
This project, **Responsive Media Dashboard**, is a full-stack web application that separates a public-facing media site from a secure admin dashboard. The public site features a homepage image slider, a photo gallery, a video showcase, and two pages embedding external dashboards via iframes ("VTC KKP" and "Dashboard PNBP"). Meanwhile, the admin dashboard provides a protected content management system (CMS) for administrators to upload, edit, and delete slider images, gallery photos, and videos, as well as manage other admin accounts.

We're building this app to give content teams an easy, centralized way to manage and present visual media, without exposing public users to CMS functionality. Key objectives include clear separation between public and admin areas, fast page loads using server-side rendering (SSR), secure file storage, and robust role-based access. Success criteria are: 1) public pages load in under two seconds; 2) admins can perform CRUD (Create, Read, Update, Delete) operations on all media; and 3) unauthorized users are prevented from accessing the admin portal.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- Public pages:
  - Home page with an image slider (carousel)
  - Gallery page displaying a responsive grid of photos
  - Video page showing embedded videos or thumbnails
  - Two static pages (`VTC KKP`, `Dashboard PNBP`) with `<iframe>` embeds
- Admin dashboard (protected by Supabase Auth):
  - CRUD interface for slider images, gallery images, and videos
  - File uploads to Supabase Storage
  - Management of admin user accounts (create, list, delete)
- Supabase integration:
  - Supabase Auth for admin sign-in (no public sign-up)
  - Supabase Database (PostgreSQL) with Row Level Security (RLS)
  - Supabase Storage for media files
- Theming support (light/dark mode) with shadcn/ui components
- Containerized local development (Docker)

### Out-of-Scope (Planned for Later)
- Public user accounts or sign-up flows
- Advanced analytics or reporting features
- Comments, likes, or social sharing for media
- Multi-language support
- Mobile apps or push notifications
- Third-party payment or e-commerce integration

## 3. User Flow

A **public visitor** lands on the Home page and sees a full-width image carousel that auto-rotates through slider images. They use the site header’s navigation links—Gallery, Video, VTC KKP, Dashboard PNBP—to explore the media. On the Gallery page, they scroll through a responsive grid of image cards. On the Video page, they view embedded clips or video thumbnails. If they select VTC KKP or Dashboard PNBP, the page renders an external dashboard via an `<iframe>`.

An **administrator** navigates to `/dashboard` and is prompted to sign in. After entering credentials, they land on the admin dashboard home, where a sidebar lists sections: Slider Images, Gallery, Videos, Users. Clicking “Gallery” opens a table of current gallery items, each with Edit and Delete actions. The admin clicks “Add New,” fills out a form (title, description, file upload), and submits. A server-side action uploads the file to Supabase Storage, writes metadata to the database, and the table refreshes to show the new item. Similar flows apply for slider images, videos, and user management.

## 4. Core Features
- **Authentication**: Supabase Auth for admin sign-in; public sign-up disabled.  
- **Public Media Pages**: Home carousel, Gallery grid, Video list, two `<iframe>` pages.  
- **Admin Dashboard**: Protected area with CRUD on slider images, gallery images, videos, admin users.  
- **File Upload**: Server actions handle file upload to Supabase Storage, then save metadata.  
- **Data Tables**: Interactive tables for listing content with edit/delete controls.  
- **Theming**: Light/dark mode using shadcn/ui (Radix UI + Tailwind CSS).  
- **Containerized Dev**: Docker and docker-compose for local environment.  
- **RLS Policies**: PostgreSQL Row Level Security for public reads and admin writes.  

## 5. Tech Stack & Tools
- **Frontend**: Next.js (App Router) with TypeScript, React hooks.  
- **UI Library**: shadcn/ui (built on Radix UI + Tailwind CSS).  
- **Backend-as-a-Service**: Supabase: Auth, PostgreSQL Database, Storage.  
- **Supabase Helpers**: `@supabase/ssr` and `@supabase/supabase-js`.  
- **Containerization**: Docker, docker-compose.  
- **Deployment**: Vercel (Next.js optimized).  
- **IDE Integrations (optional)**: GitHub Copilot, VS Code.  

## 6. Non-Functional Requirements
- **Performance**: Public pages should load in under 2 seconds on 3G/4G networks. Use SSR and caching where appropriate.  
- **Security**: All traffic over HTTPS. Enforce Supabase RLS policies. Sanitize inputs and validate file uploads (size < 10 MB, allowed types).  
- **Accessibility**: Meet WCAG 2.1 AA guidelines. Keyboard navigation and ARIA labels for all interactive components.  
- **Responsiveness**: Layout adjusts smoothly across mobile, tablet, and desktop.  
- **Scalability**: Support up to 1,000 concurrent users; offload media to Supabase Storage CDN.  

## 7. Constraints & Assumptions
- **Supabase Availability**: Assumes Supabase services (Auth, Database, Storage) are operational and within usage limits.  
- **No Public Sign-Up**: Only admins can access sign-up functionality via a separate admin-only interface or direct Supabase console.  
- **File Size & Format**: Images: JPG/PNG up to 10 MB; Videos: MP4/WEBM up to 50 MB or external embed URLs.  
- **Admin Role**: We assume any authenticated user (role=`authenticated`) is an admin.  
- **Environment**: Node.js v18+, Docker installed locally, environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, etc.) set in `.env.local` and Vercel.  

## 8. Known Issues & Potential Pitfalls
- **API Rate Limits**: Supabase has row-level and bandwidth limits. Monitor usage; implement caching for public data.  
- **RLS Misconfiguration**: Incorrect policies can block reads or writes. Test RLS rules thoroughly in the Supabase SQL editor.  
- **Server Action Latency**: Upload+insert may cause delays. Show loading skeletons or progress indicators during operations.  
- **CORS & Iframe Embeds**: External dashboards may block iframe framing. Confirm `X-Frame-Options` and CORS policies allow embedding.  
- **Deployment Mismatches**: Docker dev environment may differ from Vercel. Use identical Node and dependency versions.  
- **Large Media Handling**: Very large files can time out. Enforce client-side file size checks and consider chunked uploads if needed.

---
This PRD provides a clear, unambiguous reference for building the Responsive Media Dashboard. All subsequent technical docs (Tech Stack, Frontend Guidelines, Backend Structure, App Flow, File Structure, IDE Rules) should align directly with the details laid out here.