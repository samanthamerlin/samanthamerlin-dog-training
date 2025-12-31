# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Magic Paws Dog Training Platform - a full-stack Next.js application for a dog training business. Features client management, booking system, invoicing, and paid training content platform.

## Tech Stack

- **Framework:** Next.js 16.1.1, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui components
- **Database:** PostgreSQL (Docker container `magicpaws-postgres` on port 5433)
- **ORM:** Prisma 5.22
- **Auth:** Auth.js v5 (magic links + Google OAuth, JWT sessions for Edge compatibility)
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

## Known Issues

1. `/admin/clients` page needs to be created (currently 404)
2. `/dashboard/bookings/new` booking form may need implementation
3. Next.js middleware deprecation warning (recommends "proxy" pattern)

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
