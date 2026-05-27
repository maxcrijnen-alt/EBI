# Deploying Micro Mastery with Supabase

This app is now configured for a shareable deployment using:

- Next.js on Vercel
- Supabase Postgres as the shared database
- The app's existing server-side email/password accounts

## 1. Create Supabase project

Create a Supabase project, then open **Connect** in the Supabase dashboard.

Use two database URLs:

- `DATABASE_URL`: Supavisor transaction pooler URL for runtime app traffic. Use port `6543` and add `?pgbouncer=true&sslmode=no-verify`.
- `DIRECT_URL`: Direct or session-mode database URL for migrations. Use port `5432` and add `?sslmode=no-verify`.

Example shape:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=no-verify"
DATABASE_POOL_MAX="5"
DATABASE_SSL_REJECT_UNAUTHORIZED="false"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
AI_RATE_LIMIT_MAX="40"
AI_RATE_LIMIT_WINDOW_MINUTES="60"
SOURCE_MATERIALS_DIR="../"
DRAFT_BANK_SIZE="104"
```

## 2. Apply schema and seed data

Set the real values in `.env.local` or your shell, then run:

```bash
npm run db:migrate
npm run db:seed
```

The migration enables Row Level Security on the public tables. The app uses server-side Prisma, so no public Supabase Data API policies are granted.

## 3. Deploy to Vercel

Create a Vercel project from this folder or connected Git repository.

Add these Vercel environment variables for Production and Preview:

```env
DATABASE_URL
DIRECT_URL
DATABASE_POOL_MAX
DATABASE_SSL_REJECT_UNAUTHORIZED
OPENAI_API_KEY
OPENAI_MODEL
AI_RATE_LIMIT_MAX
AI_RATE_LIMIT_WINDOW_MINUTES
```

Then deploy:

```bash
npm run build
```

or through Vercel's Git integration.

## 4. Source ingestion and draft generation

After the schema is applied, run these from the project folder. They are additive and do not reset users or progress:

```bash
npm run ingest:sources
npm run ai:generate-drafts
```

`ingest:sources` extracts local course files into server-side chunks and topic summaries. Student pages do not display raw official source text.

`ai:generate-drafts` creates about 100 original AI-style drafts for admin review. Drafts do not enter practice until approved.

## 5. Demo accounts

After `npm run db:seed`:

- Student: `student@example.com` / `mastery123`

The seed script no longer creates a public admin account by default. To seed an admin account for a private deployment, set these before running `npm run db:seed`:

```env
SEED_ADMIN_EMAIL="your-email@example.com"
SEED_ADMIN_PASSWORD="use-a-private-password"
SEED_ADMIN_NAME="Course Admin"
```

Change or remove demo credentials before sharing widely.
