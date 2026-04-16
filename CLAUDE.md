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
npx tsx scripts/seed-menu.ts  # seed Pie-nong Thai menu items (run after db:push if schema changed)
```

## Environment

Requires a `.env` file (see `.env.example`):
```
DATABASE_URL=postgresql://...  # Neon connection string
```

## Architecture

**Stack**: SvelteKit 2 + Svelte 5 (runes mode) · Tailwind CSS v4 · Drizzle ORM · Neon (serverless PostgreSQL) · Vercel

**Auth**: Custom session-based auth — no library. `src/lib/auth.ts` handles bcrypt hashing and session tokens. Sessions are stored in the `sessions` DB table. `hooks.server.ts` validates the session cookie on every request and populates `event.locals.user`. All `(app)` routes are protected via `src/routes/(app)/+layout.server.ts`.

**Route groups**:
- `src/routes/(app)/` — protected routes (home, past, venues, profile); layout server redirects to `/login` if no session
- `src/routes/login/`, `src/routes/register/`, `src/routes/logout/` — outside the group, no auth guard

## Database schema (`src/lib/db/schema.ts`)

```
users           → sessions
venues          → venue_menu_items (flat dish×protein rows, seeded from JSON)
events          (one per Wednesday, auto-created; locked_venue_id controls food-order phase)
attendance      (yes/no per user per event; UNIQUE event+user)
venue_votes     (one vote per user per event; UNIQUE event+user)
food_orders     (one order per user per event; UNIQUE event+user)
                  meal          text    — display string, auto-populated from menu item or free-form
                  menu_item_id  uuid?   — FK → venue_menu_items ON DELETE SET NULL (null = free-form)
                  notes         text?   — optional special requests
```

`events.locked_venue_id`: null = voting phase, set = food-ordering phase.

## Home page data flow (`src/routes/(app)/+page.server.ts`)

`load`:
1. Calls `getNextWednesdayDate()` from `src/lib/utils.ts` — **uses UTC throughout** to avoid timezone drift between `getUTCDay()` and `toISOString()`
2. Upserts the event row if missing
3. Fetches all users, attendance, venues, votes, food orders (filtered by locked venue), and `venue_menu_items` for the locked venue in one `Promise.all`
4. Groups menu items by category and returns `menuByCategory`, `hasMenu`, plus the current user's order state

Actions: `toggleAttendance`, `voteVenue`, `lockVenue`, `unlockVenue`, `saveOrder`, `clearOrder`
- All use Drizzle upserts with `onConflictDoUpdate` except `clearOrder` (DELETE) and `unlockVenue` (UPDATE to null)
- `saveOrder` accepts `meal`, `menuItemId`, `notes`; multi-item orders pass `meal` as a newline-joined string and `menuItemId` as empty
- Food orders are filtered by both `event_id` AND `venue_id` so switching venues never shows stale orders

## Menu system

`venue_menu_items` stores one row per dish×protein combination. Schema: `id, venue_id, category, dish_name, description_en, menu_number, protein, price_eur, sort_order`.

Seeded via `scripts/seed-menu.ts` (Pie-nong Thai, 109 items). Re-run the script to update; it clears and re-inserts. No admin UI needed.

On the home page, when a venue with menu items is locked, the UI shows a category accordion picker instead of a free-form text input. Venues without menu items fall back to free-form. Users can select multiple items; selecting a selected item deselects it.

## UI conventions

**Design system** (inspired by `cpc-background.png` — dark teal tropical illustration):
- Background: `cpc-background.png` as a fixed full-screen layer (`position: fixed; z-index: -10`)
- Cards/sections: `bg-black/60 backdrop-blur-sm border border-white/10` (frosted glass)
- Primary action colour: **red** (`bg-red-600`) — echoes the red accent leaf
- Section labels: **amber** (`text-amber-300 text-sm font-semibold uppercase tracking-widest`) — echoes the yellow accent leaf
- Secondary buttons: `bg-white/10` hover `bg-white/15`; inputs: `bg-black/40 ring-white/20`
- Nav label for venues page is **"food"** (href `/venues`)

**Home page (`src/routes/(app)/+page.svelte`)**:
- Svelte 5 runes: `$props()`, `$state()`, `$derived()`. Forms use `use:enhance`.
- Food order section is **only shown to users who marked themselves as attending** (`data.currentUserAttending === true`). It fades in with a 0.4s slide-up animation.
- Beer emoji 🍺 has a dark `drop-shadow` CSS filter for visibility against any background colour, and uses a JS scheduler (`onMount`) to fire a CSS sip animation at random 10–20s intervals.
- Main buttons use `py-3.5 text-base` for comfortable mobile tap targets.
