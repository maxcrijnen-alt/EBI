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
OPENAI_MODEL="gpt-5-mini"
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
```

Then deploy:

```bash
npm run build
```

or through Vercel's Git integration.

## 4. Demo accounts

After `npm run db:seed`:

- Student: `student@example.com` / `mastery123`
- Admin: `admin@example.com` / `mastery123`

Change or remove these before sharing widely.
