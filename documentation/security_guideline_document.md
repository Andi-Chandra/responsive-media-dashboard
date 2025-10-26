# Security Guidelines for "responsive-media-dashboard"

This document outlines the security principles and best practices tailored to the **responsive-media-dashboard** project—a Next.js + shadcn/ui frontend with Supabase backend starter template. It covers authentication, data handling, infrastructure, and more to ensure your public media galleries and admin CMS remain secure by design.

---

## 1. Authentication & Access Control

- **Supabase Auth Integration**
  - Use Supabase Auth for all administrative logins. Disable the public sign-up flow (`/app/sign-up`).
  - Store only the `access_token` and `refresh_token` in **HttpOnly**, **Secure**, **SameSite=Strict** cookies.
  - Enforce idle and absolute session timeouts; require re-authentication for sensitive operations.

- **Role-Based Access Control (RBAC) & RLS**
  - Define a single `authenticated` role for admins in Supabase. Use Row Level Security (RLS) to restrict write operations to this role.
  - Public read access policy should allow `SELECT` on media tables; all `INSERT`, `UPDATE`, and `DELETE` operations must require an authenticated session.
  - Implement server-side authorization checks in every Next.js Server Action or API route—never rely on client-side flags.

- **Multi-Factor Authentication (Optional but Recommended)**
  - Consider enabling Supabase’s OTP/MFA capabilities for administrative logins to add a second factor.

---

## 2. Input Handling & File Uploads

- **Server-Side Validation**
  - In Next.js Server Actions or API routes, validate all incoming fields (title, description, category) against expected types and length limits.
  - Explicitly whitelist allowed fields; reject any unexpected payloads.

- **File Upload Security**
  - Restrict file types (e.g., `image/jpeg`, `image/png`, `video/mp4`) and maximum file sizes in your upload logic.
  - Scan files for malware (integrate virus-scanning service or Supabase Edge Functions) before storing in Supabase Storage.
  - Store media in a non-public bucket; generate time-limited signed URLs for public consumption.

- **Prevent Injection Attacks**
  - Use Supabase client libraries with parameterized queries under the hood; avoid constructing raw SQL in code.
  - Sanitize any user-supplied HTML or markdown before rendering (if you allow rich-text descriptions).

---

## 3. Data Protection & Privacy

- **Encryption in Transit and at Rest**
  - Enforce HTTPS/TLS (1.2+) via Vercel or custom domain settings. Redirect all HTTP traffic to HTTPS.
  - Supabase automatically encrypts data at rest in Postgres and Storage; verify compliance with your organizational policies.

- **Secrets Management**
  - Store Supabase URL, anon key, and service role key in environment variables (e.g., `.env.local`, Vercel project settings). Do **not** commit them to Git.
  - Consider using a secrets vault (HashiCorp Vault, AWS Secrets Manager) for production service-role credentials.

- **Logging & Monitoring**
  - Log authentication events (sign-in, sign-out, failed attempts) and admin actions (create/update/delete media/users).
  - Avoid logging sensitive fields (passwords, tokens). Mask or redact any personally identifiable information (PII).

---

## 4. API & Service Security

- **Next.js Server Actions & API Routes**
  - Protect every endpoint with session checks. Return `401 Unauthorized` for missing or invalid sessions.
  - Enforce appropriate HTTP verbs: `GET` for read, `POST` for create, `PUT/PATCH` for update, `DELETE` for removal.

- **Rate Limiting & Throttling**
  - Integrate middleware (e.g., `next-rate-limit`) to prevent brute-force attacks on the sign-in endpoint and excessive media requests.

- **CORS & Same-Origin Policies**
  - If you expose any API under a separate domain or subdomain, restrict CORS to your front-end origin only.

---

## 5. Web Application Security Hygiene

- **Security Headers** (configured via `next.config.js` or a custom server)
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
  - `Content-Security-Policy`: restrict script/style sources to your domain and vetted CDNs, disallow inline scripts where possible.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (prevent clickjacking)
  - `Referrer-Policy: no-referrer-when-downgrade`

- **Cookie Hardening**
  - All session cookies must be `Secure`, `HttpOnly`, and `SameSite=Strict`.

- **CSRF Protection**
  - For any state-changing requests issued from client-side forms, implement anti-CSRF tokens or use the `SameSite=Strict` cookie strategy.

- **Client-Side Storage**
  - Do not store tokens or PII in `localStorage` or `sessionStorage`.

---

## 6. Infrastructure & Configuration Management

- **Container & Deployment Hardenings**
  - Run your Node.js process under a non-root user in Docker.
  - Disable debug flags (`NODE_ENV=production`) and remove source maps from production builds.

- **Environment Management**
  - Use environment-specific configuration: `development`, `staging`, `production`.
  - Enable automatic dependency vulnerability scans in your CI/CD pipeline (GitHub Actions, GitLab CI).

- **TLS/SSL Configuration**
  - Only support TLS 1.2+ and strong cipher suites. Let Vercel or your cloud provider handle termination.

---

## 7. Dependency Management

- **Secure Dependencies**
  - Maintain `package-lock.json` or `yarn.lock` to pin versions. Review new dependency additions for security track records.

- **Regular Updates & SCA**
  - Integrate a Software Composition Analysis tool (e.g., Dependabot, Snyk) to detect and patch known vulnerabilities in both direct and transitive dependencies.

- **Minimize Attack Surface**
  - Only install and import packages actually used by your application. Remove unused dependencies regularly.

---

## 8. Ongoing Security Practices

- **Code Reviews & Penetration Testing**
  - Enforce security-focused code reviews for all pull requests, especially around authentication, file uploads, and Server Actions.
  - Schedule periodic penetration tests against your staging environment (including RLS policy testing).

- **Monitoring & Incident Response**
  - Configure alerting on abnormal patterns (multiple failed logins, high error rates).
  - Prepare an incident response plan detailing containment, eradication, recovery, and post-mortem steps.

---

By adhering to these guidelines, the **responsive-media-dashboard** project will follow a defense-in-depth approach, enforce least privilege, and maintain secure defaults—from development through production.