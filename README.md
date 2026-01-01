# Samantha Merlin Dog Training Platform

A full-stack Next.js application for dog training services featuring client management, booking system, invoicing, and paid training content.

## Live Site

- **Production:** https://app.samanthamerlin.com
- **Render Dashboard:** https://dashboard.render.com

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** PostgreSQL (Render)
- **ORM:** Prisma
- **Auth:** Auth.js v5 (magic links via Resend)
- **Email:** Resend
- **Styling:** Tailwind CSS 4, shadcn/ui

## Local Development

### Prerequisites
- Node.js 22+
- Docker (for local PostgreSQL)

### Setup

```bash
# Install dependencies
npm install

# Start local PostgreSQL
docker start magicpaws-postgres

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed test data
npx prisma db seed

# Start dev server
npm run dev
```

Local app runs at http://localhost:3001

### Local Database
```
DATABASE_URL="postgresql://magicpaws:magicpaws123@localhost:5433/magicpaws?schema=public"
```

### Testing Login (Development)
Magic links are logged to the terminal in dev mode - no email needed.

## Production Deployment (Render)

### Services
| Service | Type | URL |
|---------|------|-----|
| samanthamerlin-dog-training | Web Service | https://app.samanthamerlin.com |
| samanthamerlin-db | PostgreSQL | Internal |

### Environment Variables (Render)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Render PostgreSQL internal URL |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | `https://app.samanthamerlin.com` |
| `AUTH_RESEND_KEY` | Resend API key |
| `EMAIL_FROM` | `Samantha Merlin <noreply@samanthamerlin.com>` |
| `ADMIN_EMAIL` | Email to auto-assign admin role |
| `NEXT_PUBLIC_APP_URL` | `https://app.samanthamerlin.com` |
| `NODE_ENV` | `production` |

### Build & Start Commands
- **Build:** `npm install && npx prisma generate && npm run build`
- **Start:** `npm run start`

### Database Management (Render Shell)
```bash
# Push schema changes
npx prisma db push

# Seed database
npx prisma db seed

# Query database
psql $DATABASE_URL -c "SELECT * FROM users;"
```

## DNS Configuration (Squarespace)

| Type | Host | Value |
|------|------|-------|
| CNAME | app | samanthamerlin-dog-training.onrender.com |
| TXT | resend._domainkey | (DKIM key from Resend) |
| TXT | send | v=spf1 include:amazonses.com ~all |
| MX | send | feedback-smtp.us-east-1.amazonses.com |

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Public pages (/, /about, /services, etc.)
│   ├── (auth)/          # /login, /verify
│   ├── (dashboard)/     # Client portal (/dashboard/*)
│   ├── (admin)/         # Admin portal (/admin/*)
│   └── api/             # API routes
├── components/          # React components
└── lib/                 # Utilities (auth, db, email, stripe)
```

## Test Accounts (Seeded)

| Email | Role |
|-------|------|
| samantha@magicpaws.com | ADMIN |
| john.smith@example.com | CLIENT |
| sarah.johnson@example.com | CLIENT |
| michael.chen@example.com | CLIENT |

## External Services

| Service | Dashboard |
|---------|-----------|
| Render | https://dashboard.render.com |
| Resend | https://resend.com |
| GitHub | https://github.com/samanthamerlin/samanthamerlin-dog-training |
