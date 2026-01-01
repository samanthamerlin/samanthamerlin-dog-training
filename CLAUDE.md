# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Magic Paws Dog Training Platform - a full-stack Next.js application for Samantha Merlin's dog training business in Mill Valley, CA. Features client management, booking system, invoicing, calendar view, and paid training content platform.

**Live URL:** https://app.samanthamerlin.com (deployed on Render)

## Tech Stack

- **Framework:** Next.js 16.1.1, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui components
- **Database:** PostgreSQL (Render production / Docker local on port 5433)
- **ORM:** Prisma 5.22
- **Auth:** Auth.js v5 (magic links via Resend, JWT sessions for Edge compatibility)
- **Email:** Resend (dev mode logs magic links to console)
- **Payments:** Stripe (lazy-loaded)

## Development Commands

```bash
# Start PostgreSQL
docker start magicpaws-postgres

# Start dev server (usually runs on http://localhost:3001)
npm run dev

# Build production
npm run build

# Lint
npm run lint

# Database commands
npx prisma generate          # Generate client after schema changes
npx prisma db push           # Push schema changes
npx prisma db push --force-reset && npx prisma db seed  # Reset and reseed
npx prisma studio            # Open database GUI (npm run db:studio)
```

## Database Connection

```
DATABASE_URL="postgresql://magicpaws:magicpaws123@localhost:5433/magicpaws?schema=public"
```

## Authentication Testing (Dev Mode)

Magic links are logged to the terminal instead of being emailed:
1. Go to `/login` and enter an email
2. Check terminal for the magic link URL
3. Copy/paste URL into browser (single-use)

**Test Accounts (seeded):**
| Email | Role | Notes |
|-------|------|-------|
| samantha@magicpaws.com | ADMIN | Full admin access |
| john.smith@example.com | CLIENT | 1 dog, 1 confirmed booking |
| sarah.johnson@example.com | CLIENT | 2 dogs |
| michael.chen@example.com | CLIENT | 1 dog |

## Architecture

### Route Groups (Next.js App Router)

- `(marketing)/` - Public pages: `/`, `/about`, `/services`, `/training`, `/contact`
- `(auth)/` - `/login`, `/verify`
- `(dashboard)/` - Client portal at `/dashboard/*`
- `(admin)/` - Admin portal at `/admin/*`
- `api/` - API routes

### Key Modules

- `src/lib/auth.ts` - Auth.js config with JWT sessions, role management
- `src/lib/db.ts` - Prisma client singleton
- `src/lib/email.ts` - Resend integration + email templates
- `src/lib/stripe.ts` - Lazy-loaded Stripe client
- `src/middleware.ts` - Auth protection, admin route guards

### Path Alias

Use `@/*` for imports from `./src/*` (e.g., `@/lib/db`, `@/components/ui/button`)

### Database Schema (Key Models)

**Auth:** User (with role: ADMIN/CLIENT/SUBSCRIBER), Account, Session

**Client Management:** ClientProfile, Dog

**Booking:** ServiceType, BookingRequest (PENDING → CONFIRMED/REJECTED), BookingDog, ServiceRecord

**Billing:** Invoice, InvoiceItem, Payment

**Training Content:** ContentTier, ContentModule, ContentLesson, TierPurchase, LessonProgress

**Marketing:** EmailCampaign, EmailRecipient, NotificationPreference

## Deployment (Render)

**GitHub Repo:** https://github.com/samanthamerlin/samanthamerlin-dog-training

The app auto-deploys from the `main` branch. To reseed the production database:
1. Go to Render Dashboard → Web Service → Shell
2. Run: `npx prisma db seed`

## Services Offered

1. **Training** - Private training sessions ($140/hr) - Blue on calendar
2. **Day Hike** - Group hikes on Marin trails ($55/session) - Green on calendar
3. **Boarding** - Home boarding ($100/day) - Purple on calendar
4. **Grooming** - Professional grooming ($50/session) - Pink on calendar

## Admin Features

- **Dashboard** (`/admin`) - Stats: clients, pending bookings, completed sessions, revenue
- **Calendar** (`/admin/calendar`) - Visual calendar with color-coded services, shows dog name + service type
- **Bookings** (`/admin/bookings`) - Approve/reject booking requests
- **Clients** (`/admin/clients`) - View all clients and their dogs
- **Services** (`/admin/services`) - Service records for invoicing
- **Invoices** (`/admin/invoices`) - Generate and manage invoices
- **Reports** (`/admin/reports`) - Revenue reports with service breakdown
- **Campaigns** (`/admin/campaigns`) - Email marketing campaigns

## Middleware Behavior

- Admins logging in are redirected to `/admin` (not `/dashboard`)
- Admins can view client dashboard via "Client View" button (uses `?view=client` param)
- Non-admins cannot access `/admin/*` routes

## Seed Data

The seed creates 2 years of historical data:
- 25 clients with Marin County addresses
- 40+ dogs with various breeds
- 400+ bookings across all service types
- ServiceRecord entries for completed bookings
- Invoices with realistic payment status (88% paid, 7% sent, 5% overdue)
- 20 upcoming bookings for next 2 weeks

## Known Issues

1. Next.js middleware deprecation warning (recommends "proxy" pattern)

## Pending Tasks

1. **Reseed production database** - Run `npx prisma db seed` on Render to populate ServiceRecord data
2. Test all admin pages after reseed to confirm data displays correctly

## Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `RESEND_API_KEY` - For email sending
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL` - Application URL

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `ADMIN_EMAIL` - Auto-assigns ADMIN role on signup
