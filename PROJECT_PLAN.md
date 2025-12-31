# Magic Paws Dog Training Platform - Implementation Plan

## Project Overview

Replace Samantha Merlin's Squarespace website with a modern, full-featured business platform for dog training services in Mill Valley, CA.

**Current State:** Squarespace site at samanthamerlin.com with basic contact form
**Target State:** Full-stack Next.js application with client management, booking, invoicing, and paid training content

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15 + React 19 + TypeScript | Modern, fast, SEO-friendly |
| Styling | Tailwind CSS + shadcn/ui | Teal/turquoise brand theme |
| Database | PostgreSQL (Render) | Relational data, reporting |
| ORM | Prisma | Type-safe database access |
| Auth | Auth.js v5 | Magic links for clients, Google for admin |
| Payments | Stripe | Apple Pay, Google Pay, subscriptions |
| Email | Resend | Transactional emails, magic links |
| Video | YouTube (unlisted) | Training content delivery |
| Hosting | Render | ~$14/month (web service + PostgreSQL) |

---

## Core Features

### 1. Client Management
- Client profiles with contact info, notes
- Dog profiles (breed, health, training level, behavior notes)
- Service history per client/dog

### 2. Hybrid Booking System
- Clients submit booking requests online
- Samantha reviews and approves/rejects via admin dashboard
- Services: Training ($140/hr), Grooming ($20-40), Boarding ($100/day), Day Hike ($55)
- Email notifications on status changes

### 3. Invoicing & Payments
- Monthly invoice generation from service records
- Stripe Checkout for payments (Apple Pay, Google Pay, cards)
- Invoice PDF generation and email delivery
- Yearly tax summary reports

### 4. Paid Training Content
- Three tiers: Foundation, Intermediate, Advanced
- One-time purchase per tier (lifetime access)
- Optional monthly "Live Support" subscription add-on
- Unlisted YouTube videos with access control
- Progress tracking per user

### 5. Marketing & Communications
- Email campaigns to all or selected clients
- Automated booking reminders
- Social media integration prep (Instagram, Facebook, YouTube)

---

## Confirmed Pricing

**Training Tiers (one-time purchase, lifetime access):**
- Foundation: $29
- Intermediate: $49
- Advanced: $79

**Live Support Subscription:** $19/month

**Services (existing):**
- Dog Training: $140/hour
- Grooming: $20-$40
- Boarding: $100/day
- Social Day Hike: $55

---

## Database Schema (Key Entities)

```
User (auth) ─── ClientProfile ─── Dog
                     │
              BookingRequest ─── ServiceRecord ─── InvoiceItem ─── Invoice

User ─── TierPurchase ─── ContentTier ─── ContentModule ─── ContentLesson
   │
   └── Subscription (Live Support monthly)
```

**Key Tables:**
- `users` - Authentication, roles (ADMIN, CLIENT, SUBSCRIBER)
- `client_profiles` - Contact info, emergency contacts
- `dogs` - Pet details, health, behavior, training level
- `service_types` - Service catalog with pricing
- `booking_requests` - Pending/confirmed/rejected bookings
- `service_records` - Completed services for invoicing
- `invoices` / `invoice_items` - Monthly billing
- `content_tiers` / `content_modules` / `content_lessons` - Training library
- `tier_purchases` - One-time tier access grants
- `subscriptions` - Monthly live support subscriptions

---

## Folder Structure

```
magic-paws/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Public pages (home, about, services, contact)
│   │   ├── (auth)/            # Login, register, verify
│   │   ├── (dashboard)/       # Client portal (profile, dogs, bookings, invoices, training)
│   │   ├── (admin)/           # Admin dashboard (clients, bookings, calendar, invoices, content, reports)
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── forms/             # BookingForm, DogForm, etc.
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   └── features/          # Booking, Content, Invoice components
│   ├── lib/                   # auth.ts, db.ts, stripe.ts, email.ts
│   ├── services/              # Business logic (booking, invoice, content)
│   └── types/                 # TypeScript definitions
└── emails/                    # React Email templates
```

---

## Implementation Phases

### Phase 1: Foundation
- Initialize Next.js project with Tailwind + shadcn/ui
- Create marketing pages (home, about, services, contact)
- Set up PostgreSQL on Render
- Implement Auth.js with magic links + Google OAuth
- Build client profile and dog management
- Deploy to Render with custom domain

### Phase 2: Booking & Services
- Service types and booking request system
- Admin booking queue (approve/reject workflow)
- Calendar view for scheduled services
- Service record tracking
- Email notifications

### Phase 3: Invoicing & Payments
- Invoice generation from service records
- Stripe integration for payments
- Invoice PDF and email delivery
- Revenue reports and tax summaries

### Phase 4: Training Content Platform
- Content tier/module/lesson management (admin CMS)
- Stripe checkout for tier purchases
- Access-controlled video player (YouTube embeds)
- Monthly live support subscription
- Progress tracking

### Phase 5: Marketing & Communications
- Email campaign builder
- Automated notifications (reminders, milestones)
- Social media integration prep

---

## Critical Files to Create

1. `/src/lib/auth.ts` - Auth.js configuration with role-based access
2. `/prisma/schema.prisma` - Complete database schema
3. `/src/app/api/webhooks/stripe/route.ts` - Stripe payment webhook handler
4. `/src/components/features/content/VideoPlayer.tsx` - Access-controlled YouTube embed
5. `/src/services/invoice.service.ts` - Invoice generation business logic

---

## Deployment (Render)

| Service | Plan | Cost |
|---------|------|------|
| Web Service (Next.js) | Starter | $7/mo |
| PostgreSQL | Starter | $7/mo |
| **Total** | | **$14/mo** |

Custom domain: samanthamerlin.com (DNS update from current Squarespace)

---

## API Endpoints Overview

```
/api/auth/[...nextauth]     # Authentication
/api/clients                # Client CRUD + dogs
/api/bookings               # Booking requests, confirm/reject
/api/services               # Service types and records
/api/invoices               # Invoice generation, PDF, send
/api/content                # Training content, access control
/api/payments               # Stripe checkout, subscriptions
/api/webhooks/stripe        # Payment webhooks
/api/marketing              # Email campaigns
/api/reports                # Revenue, tax summaries
```

---

## Notes for Samantha

**Things to prepare before we start:**
1. Your admin email address for Google OAuth login
2. Stripe account (stripe.com) - free to create, fees only when processing payments
3. Domain DNS access (to point samanthamerlin.com to Render)
4. Training content outline (module/lesson structure for each tier)
5. High-res logo and brand assets

**Things to think about:**
- Do you want clients to pay per tier, or offer bundles (e.g., all 3 tiers for $129)?
- Should "Live Support" include anything specific (weekly Q&A calls, chat access, etc.)?
- Any specific reports you need for taxes beyond revenue summaries?
- Priority of which phase to launch first vs. what can wait?

---

*Plan created: December 31, 2024*
*Ready to implement when you are!*
