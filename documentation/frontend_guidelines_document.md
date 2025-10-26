# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the "responsive-media-dashboard" project. It is written in everyday language to help anyone understand how the frontend is set up, maintained, and extended.

## 1. Frontend Architecture

**Framework & Libraries**
- **Next.js (App Router)**: Core framework providing server-side rendering (SSR), file-based routing, nested layouts, API Routes, and Server Actions.  
- **TypeScript**: Ensures type safety and catches errors early.  
- **shadcn/ui**: A design system built on Radix UI primitives and styled with Tailwind CSS.  
- **Tailwind CSS**: A utility-first CSS framework for rapid styling and theming.  
- **Supabase**: Backend-as-a-Service for authentication, PostgreSQL database, and storage of media assets.  
- **Docker & Docker-Compose**: Containerizes the app for consistent local development.  

**Scalability, Maintainability, Performance**
- **File-based Routing & Layouts**: Clear folder structure under `/app` allows easy addition of new pages and nested UI.  
- **Component-Based**: UI broken down into reusable components (e.g., `Carousel`, `DataTable`, `Card`).  
- **Server vs. Client Components**: Critical data fetching and secure operations run on the server. Interactive parts use client components.  
- **Supabase SSR Helpers**: Built-in caching and revalidation for fast data loads.  
- **Containerization**: Docker ensures parity between dev and production, reducing "works on my machine" issues.  

## 2. Design Principles

1. **Usability**: Interfaces are simple and intuitive. Navigation links and actions (e.g., “Add Image,” “Edit User”) follow predictable patterns.  
2. **Accessibility**: All components meet WCAG guidelines. Radix UI primitives and shadcn/ui ensure keyboard navigation, focus states, and ARIA support.  
3. **Responsiveness**: Layouts adapt to mobile, tablet, and desktop. Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`) make it easy to adjust padding, grids, and typography.  
4. **Consistency**: Shared design tokens for spacing, colors, and typography keep the UI unified across public pages and the admin portal.  
5. **Performance-First**: Lazy loading, code splitting, and optimized media assets keep pages snappy.  

### Applying Principles in UI
- **Navigation**: Clear header links (Home, Gallery, Video, VTC KKP, Dashboard PNBP, Sign In).  
- **Forms & Dialogs**: Use shadcn/ui `Dialog` and form components with clear labels, validation messages, and keyboard support.  
- **Feedback**: Toast notifications and loading skeletons inform users of actions and data fetching.  

## 3. Styling and Theming

### Styling Approach
- **Tailwind CSS**: Utility classes handle most styling; minimal custom CSS.  
- **Tailwind Configuration**: Extended with custom color palette and breakpoints.  

### Theming
- **Light & Dark Modes**: Toggle via a theme switch in the header; controlled by a CSS class on `<html>`.  
- **Design Tokens**: Defined in `tailwind.config.js` for colors, spacing, font sizes, and shadows.  

### Visual Style
- **Overall Style**: Modern flat design with subtle glassmorphism on cards and dialogs (semi-transparent backgrounds, soft shadows).  

### Color Palette
- **Primary**: Indigo 600 (#4F46E5)  
- **Secondary**: Pink 400 (#F472B6)  
- **Accent**: Emerald 500 (#10B981)  
- **Background (Light)**: Gray 50 (#F9FAFB)  
- **Background (Dark)**: Gray 800 (#1F2937)  
- **Surface Light**: White (#FFFFFF)  
- **Surface Dark**: Gray 900 (#111827)  
- **Text (Light)**: Gray 900 (#111827)  
- **Text (Dark)**: Gray 100 (#F3F4F6)  

### Typography
- **Font Family**: Inter, system-font fallback (–apple-system, BlinkMacSystemFont, "Segoe UI", Roboto).  
- **Headings**: `font-semibold` with sizes from `text-xl` to `text-4xl`.  
- **Body**: `font-normal` at `text-base` and `text-sm` for secondary text.  

## 4. Component Structure

- **`/components` Folder**: All reusable UI pieces live here.  
  • `/ui`: shadcn/ui components (Buttons, Dialogs, Inputs, Carousels).  
  • `SiteHeader.tsx`: Main navigation bar.  
  • `DataTable.tsx`: Generic table for listing and managing content.  
- **Organization by Feature**: Admin pages have feature-specific subfolders, e.g., `/components/dashboard/gallery`, containing `GalleryTable.tsx`, `GalleryForm.tsx`.  
- **Reusability**: Shared pieces (cards, dialogs, form fields) live in `/components/ui` and are imported everywhere.  

**Why Component-Based?**
- **Maintainability**: Fix a bug or tweak a style in one place and it updates across the app.  
- **Consistency**: Uniform look and feel with shared components.  
- **Onboarding**: New developers quickly find and reuse existing components.

## 5. State Management

- **Local State**: React `useState` and `useReducer` for form inputs and UI toggles.  
- **Server Data & Caching**:  
  • `@supabase/ssr`: Fetch data on the server, cache results, and revalidate on demand.  
  • Next.js Server Actions: Mutations (create, update, delete) run on the server to keep secrets safe.  
- **Global Context**: A small React Context for theme toggling and user session data (if needed).  

This approach keeps the frontend simple while ensuring data consistency and secure operations.

## 6. Routing and Navigation

- **Next.js App Router**: File-based under `/app`.  
  • `/app/page.tsx` → Home  
  • `/app/gallery/page.tsx` → Gallery  
  • `/app/video/page.tsx` → Video  
  • `/app/vtc-kkp/page.tsx` & `/app/dashboard-pnbp/page.tsx` → Iframe pages  
  • `/app/sign-in/page.tsx` → Admin login  
  • `/app/dashboard/**` → Protected admin area  
- **Nested Layouts**:  
  • Root `layout.tsx` with site header and footer.  
  • `/dashboard/layout.tsx` adds sidebar and admin nav.  
- **Linking**: Use `next/link` for client-side navigation and prefetching.  

## 7. Performance Optimization

1. **Server-Side Rendering & Static Generation**: Public pages use SSR or static props for fast Time to First Byte.  
2. **Image & Video Optimization**:  
   • `next/image` for automatic resizing, lazy loading, and formats (WebP, AVIF).  
   • Lazy load non-critical content (iframes, below-the-fold galleries).  
3. **Code Splitting & Dynamic Imports**: Heavy components (e.g., rich text editors, data tables) loaded only when needed.  
4. **Asset Optimization**:  
   • Tree-shaking via ES modules.  
   • Minification of JavaScript and CSS.  
5. **Prefetching**: Next.js link prefetch for likely next pages (e.g., hover over Gallery).  
6. **Caching & Revalidation**: HTTP caching headers and incremental static regeneration for public content.  

These measures ensure a snappy user experience across devices.

## 8. Testing and Quality Assurance

**Unit Tests**
- **Framework**: Jest  
- **Utilities**: React Testing Library for component rendering and interactions.  
- **Focus**: Logic in custom hooks, utility functions, small components (buttons, inputs).  

**Integration Tests**
- **Framework**: Jest + React Testing Library  
- **Scope**: Component combinations (forms, modals), data-fetching hooks with mocked Supabase client.  

**End-to-End Tests**
- **Framework**: Cypress or Playwright  
- **Scenarios**:  
   • Public flow: View gallery, slide images, load videos.  
   • Admin flow: Sign in, add/edit/delete media, verify RLS enforcement.  

**Accessibility Testing**
- **Tools**: axe-core, cypress-axe for automated checks.  
- **Manual Audits**: Keyboard navigation and screen-reader walkthroughs.  

**Linting & Formatting**
- **ESLint** with `eslint-config-next` and Prettier to enforce code style.  
- **Pre-commit Hooks**: Husky + lint-staged to run tests and linters on staged files.  

## 9. Conclusion and Overall Frontend Summary

This frontend guideline lays out a clear, component-based architecture using Next.js, TypeScript, shadcn/ui, and Tailwind CSS. We rely on Supabase for secure auth, data, and media storage, and Docker for consistent development. Key design principles—usability, accessibility, responsiveness, and performance—drive every decision. Testing at all levels (unit, integration, E2E, accessibility) ensures reliability as the app scales. 

By following these guidelines, developers will create a maintainable, performant, and user-friendly public media site and admin dashboard that meets both business goals and user needs with no ambiguity.