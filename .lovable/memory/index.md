# Project Memory

## Core
Hersky DJ & AV: sophisticated gold/rose/lavender theme, Playfair Display headers.
Multi-page architecture: strictly use dedicated routes, never section anchors.
Tech stack: Supabase, Resend (@hersky.ca), FormSubmit.co, Stripe, Capacitor PWA.
Financials: 13% HST on all orders, 50% deposit via Stripe.
Security: All Edge Functions require JWT + RBAC (admin: hersky.ott@gmail.com).

## Memories
- [Pricing Model](mem://business/pricing-model) — Base pricing tiers, package rates, and school surcharges
- [Service Categories](mem://business/service-categories) — The 7 primary event types and services offered
- [Add-on Services](mem://business/add-on-services) — Pricing for specific enhancements like Sparklers, Photo Booths
- [Visual Theme](mem://style/visual-theme) — Sophisticated wedding DJ aesthetics, mobile nav glow, and card opacity
- [Brand Identity & Contact](mem://business/brand-identity) — Background info, 97% satisfaction, and contact details
- [Form Submission & Routing](mem://tech/form-submission) — General vs post-booking form and email routing logic
- [Client Portal](mem://features/client-portal) — Event music management, priority requests, and playlist pasting
- [Infrastructure](mem://tech/infrastructure) — Core backend stack, database, and third-party services
- [Booking Flow & Checkout](mem://features/booking-flow) — Multi-step checkout, digital signatures, deposit, and sticky summary
- [Admin Dashboard](mem://features/admin-dashboard) — Restricted admin access for events, music requests, and PDF exports
- [Service-Specific Routing](mem://features/service-specific-routing) — Architecture constraint forbidding section anchors
- [PWA & Mobile App](mem://tech/platform-expansion) — Capacitor configuration, haptics, and /install guide
- [Email Automation](mem://features/email-automation) — Supabase pg_cron jobs for music submission and 14-day event reminders
- [Edge Function Security](mem://tech/security-standard) — JWT and RBAC requirements for Supabase backend
- [Contact System](mem://features/contact-system) — Combined inquiry and categorized package selection form
- [Mentorship Program](mem://features/mentorship-program) — Two-track DJ mentorship pathways, pricing, and apply flow at /mentorship
- [DJ Lessons LMS](mem://features/dj-lessons-lms) — Internal 24-module video+quiz course with access control and progress tracking
