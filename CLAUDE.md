# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run check        # TypeScript + Svelte type-check (run after every change)
npm run db:push      # push schema changes directly to Neon DB (dev)
npm run db:generate  # generate SQL migration files
npm run db:migrate   # apply generated migrations
npm run db:studio    # open Drizzle Studio (DB browser)
```

## Environment

Requires a `.env` file (see `.env.example`):
```
DATABASE_URL=postgresql://...  # Neon connection string
```

## Architecture

**Stack**: SvelteKit 2 + Svelte 5 (runes mode) · Tailwind CSS v4 · Drizzle ORM · Neon (serverless PostgreSQL) · Vercel

**Auth**: Custom session-based auth — no library. `src/lib/auth.ts` handles bcrypt hashing and session tokens. Sessions are stored in the `sessions` DB table. The `hooks.server.ts` validates the session cookie on every request and populates `event.locals.user`. All `(app)` routes are protected via `src/routes/(app)/+layout.server.ts`.

**Route groups**:
- `src/routes/(app)/` — protected routes (home, past, venues, profile); layout server redirects to `/login` if no session
- `src/routes/login/`, `src/routes/register/`, `src/routes/logout/` — outside the group, no auth guard

**Database** (`src/lib/db/schema.ts`): `users` → `sessions`, `venues`, `events` (one per Wednesday, auto-created), `attendance` (yes/no per user per event), `venue_votes` (one vote per user per event), `food_orders` (one meal per user per event). The `events.locked_venue_id` column controls the food-order phase: null = voting open, set = meal input open.

**Key data flow on home page** (`src/routes/(app)/+page.server.ts`): the load function calls `getNextWednesdayDate()` (from `src/lib/utils.ts`), upserts the event row if missing, then fetches all users + attendance + venues + votes + food orders in one `Promise.all`. Actions (`toggleAttendance`, `voteVenue`, `lockVenue`, `saveOrder`) all use Drizzle upserts with `onConflictDoUpdate`.

**Svelte 5 runes**: all components use `$props()`, `$state()`, `$derived()`. Forms use `use:enhance` from `$app/forms` for non-reload submissions.
