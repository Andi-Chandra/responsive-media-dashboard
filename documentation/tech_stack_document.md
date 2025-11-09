# Tech Stack Document for Responsive Media Dashboard

This document explains the technology choices behind the Responsive Media Dashboard starter template. It's written in clear, everyday language so anyone can understand why we picked each tool and how they work together.

## Frontend Technologies

These are the tools that shape what you see and how you interact with the site.

- **Next.js (with App Router)**
  - Provides page-based routing and server-side rendering out of the box.
  - Lets us load data on the server, which makes pages load faster and improves SEO.

- **TypeScript**
  - A version of JavaScript with built-in checks to catch mistakes early.
  - Helps keep the codebase clear and reduces bugs as the project grows.

- **shadcn/ui**
  - A collection of ready-made, accessible UI components (buttons, dialogs, carousels).
  - Built on top of Radix UI primitives, giving us consistent styling and behavior.

- **Tailwind CSS**
  - A utility-first styling framework: instead of writing custom CSS, we pick ready classes.
  - Speeds up design work and keeps the final CSS bundle small.

- **Radix UI**
  - Underpins shadcn/ui with unstyled, accessible building blocks.
  - Gives us full control over look and feel while handling keyboard/mouse interactions.

- **React Hooks**
  - Built-in state and effect management tools (useState, useEffect, etc.).
  - Keeps component logic clean and easy to follow without extra libraries.

- **Next.js Image & Head Components**
  - Optimizes images automatically (resizing, lazy loading).
  - Manages HTML head tags (title, meta) for better SEO and social sharing.

## Backend Technologies

These tools power the data and logic behind the scenes, including content storage and user authentication.

- **Supabase**
  - A Backend-as-a-Service platform built on PostgreSQL.
  - Handles:
    - **Auth**: Secure sign-in flow for admin users (public sign-up disabled).
    - **Database**: Stores metadata for sliders, gallery images, and videos.
    - **Storage**: Hosts the actual image and video files.

- **@supabase/supabase-js & @supabase/ssr**
  - Official JavaScript libraries to talk to Supabase from both browser and server.
  - Offer helper functions for data fetching, file uploads, and user sessions.

- **Next.js Server Actions**
  - Let us run code on the server when a form is submitted (for example, uploading a file).
  - Keep API logic close to the page or component that needs it, simplifying development.

- **PostgreSQL (via Supabase)**
  - Stores structured data with full SQL power.
  - We use Row Level Security (RLS) policies to let anyone read public content but only admins can edit.

## Infrastructure and Deployment

How we host, build, and maintain the application.

- **Vercel**
  - The recommended platform for hosting Next.js apps.
  - Provides automatic builds and deployments on every code push.

- **Docker (for local development)**
  - Includes a Dockerfile and docker-compose setup to mirror production-like environments.
  - Ensures all team members work in the same setup, avoiding “it works on my machine” issues.

- **Git & GitHub**
  - Version control system to track code changes.
  - GitHub repository for collaboration, code reviews, and issue tracking.

- **Continuous Deployment**
  - Vercel’s built-in pipeline builds and deploys the app whenever changes land on the main branch.
  - Keeps staging and production versions up to date automatically.

- **Environment Variables**
  - Securely store Supabase keys and other secrets in Vercel’s settings or a `.env.local` file for local development.

## Third-Party Integrations

Services we connect to for added functionality without reinventing the wheel.

- **Supabase (Auth, Database, Storage)**
  - Described above under Backend Technologies.

- **Embedded Dashboards**
  - Two public pages (`VTC KKP` and `Dashboard PNBP`) simply render external content via `<iframe>`.
  - Gives users direct access to those dashboards without leaving the site.

- **Browser Analytics (optional)**
  - You can plug in tools like Google Analytics or Plausible by adding their scripts in the Next.js head.
  - Helps you track visitor behavior on public pages.

## Security and Performance Considerations

Measures we’ve taken to keep the app safe and snappy.

- **Authentication & Authorization**
  - Supabase Auth ensures only approved admins can sign in.
  - Public sign-up is disabled to prevent unwanted accounts.
  - Server Actions and API calls always check the user session before making changes.

- **Row Level Security (RLS)**
  - SQL policies grant read-only access to anyone visiting the public site.
  - Only users with an authenticated role can insert, update, or delete records.

- **Data Protection**
  - All secrets (API keys, database URLs) live in environment variables, not in the code.

- **Performance Optimizations**
  - Server-side rendering (SSR) and static generation (SSG) for fast initial loads.
  - Automatic image optimization via Next.js `Image` component.
  - Tailwind CSS removes unused styles in production builds, keeping CSS bundles small.

## Conclusion and Overall Tech Stack Summary

We chose this mix of technologies to balance ease of development, performance, maintainability, and security:

- **Next.js + TypeScript** gives us a modern, type-safe foundation with built-in rendering strategies.
- **shadcn/ui (Radix + Tailwind)** offers polished, accessible UI components without sacrificing flexibility.
- **Supabase** streamlines backend needs—authentication, database, and file storage—under a single roof.
- **Docker, GitHub, and Vercel** create a reliable development-to-deployment pipeline.

Together, these tools let you quickly launch a responsive public media site and a secure admin portal, with clear paths for future growth (analytics, more integrations, custom theming, and so on). This tech stack is designed to be both developer-friendly and user-focused, ensuring a smooth experience on every device.