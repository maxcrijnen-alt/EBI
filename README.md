# Micro Mastery: Markets & Games

Adaptive study platform for Tilburg University Microeconomics: Markets and Games.

The app supports multiple students, personal progress, diagnostic practice, AI-style explanations, rubric feedback, flashcards, mistakes, mock practice, panic mode, and admin review.

## Deployment status

The app is configured for Supabase Postgres and Vercel.

Read [DEPLOYMENT.md](./DEPLOYMENT.md) before sharing it with classmates.

## Required environment variables

Copy `.env.example` to `.env.local` and fill in the real Supabase values:

```bash
DATABASE_URL=
DIRECT_URL=
DATABASE_POOL_MAX=5
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

## Setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts after seeding

- Student: `student@example.com` / `mastery123`
- Admin: `admin@example.com` / `mastery123`
