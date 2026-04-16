# CPC Boozer — Project Context

A mobile-first web app for a small group of friends to organise their weekly Wednesday get-together at a local bar: who's coming for drinks, and who wants in on a collective food order.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes mode throughout) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin, no config file needed) |
| Database | Neon DB (serverless PostgreSQL) |
| ORM | Drizzle ORM — `drizzle-orm/neon-http` driver |
| Auth | Custom session auth — bcryptjs + `crypto.getRandomValues` tokens |
| Deployment | Vercel (`@sveltejs/adapter-vercel`) |

**Svelte 5 runes** are enforced for all non-library files via `svelte.config.js` (`runes: true`). Always use `$props()`, `$state()`, `$derived()`, `{@render children()}` — never the old `export let` / `<slot>` syntax.

---

## Environment

One required env var:
```
DATABASE_URL=postgresql://...   # Neon connection string
```

Locally: `.env` (gitignored). On Vercel: set in dashboard (Neon integration auto-populates it).

For drizzle-kit commands to work locally, `DATABASE_URL` must be in `.env` (not just `.env.local`). The `.env.local` file (created by `vercel env pull`) is also gitignored.

---

## Commands

```bash
npm run dev          # dev server
npm run check        # TypeScript + Svelte type-check — run after every change
npm run db:push      # apply schema changes directly to Neon (dev workflow)
npm run db:generate  # generate SQL migrations
npm run db:studio    # Drizzle Studio DB browser
npx tsx scripts/seed-menu.ts   # seed Pie-nong Thai menu (run once after creating the venue)
```

---

## Database Schema

All tables in `src/lib/db/schema.ts`. Full Drizzle schema — push with `npm run db:push`.

```
users               id, name (unique, used for login + display), password_hash
sessions            id (random hex token), user_id → users, expires_at
venues              id, name (unique), description?, url?, created_by → users
events              id, date (unique, always a Wednesday), label?, locked_venue_id? → venues
attendance          event_id + user_id (unique), attending (bool), updated_at
venue_votes         event_id + user_id (unique), venue_id → venues
venue_menu_items    venue_id → venues, category, dish_name, description_en?, menu_number (text),
                    protein, price_eur (numeric), sort_order
food_orders         event_id + user_id (unique), venue_id, meal (text), menu_item_id? → venue_menu_items,
                    notes?
```

Key design decisions:
- `venue_menu_items.menu_number` is `text` to handle decimals like `4.1`, `78.1`
- `food_orders.meal` always stores a human-readable string regardless of whether the order came from a menu picker or free-form input — no join needed for display
- `food_orders.menu_item_id` is nullable (`ON DELETE SET NULL`) — free-form orders leave it null
- `events.locked_venue_id` is the gating field: null = voting phase, set = food ordering phase

---

## Auth

Implemented in `src/lib/auth.ts`. No library — fully custom:
- Passwords hashed with `bcryptjs` (12 rounds)
- Session tokens are 32-byte hex strings via `crypto.getRandomValues`
- Sessions stored in the `sessions` table with 30-day expiry
- `src/hooks.server.ts` validates the `session` cookie on every request and populates `event.locals.user`
- `app.d.ts` declares `App.Locals.user: { id: string; name: string } | null`

---

## Route Structure

```
src/routes/
  +layout.svelte            root layout — imports app.css, sets favicon (cpc-boozers.png)
  login/                    public — login form
  register/                 public — register form
  logout/                   POST action — clears cookie + session row
  (app)/                    route group — all routes here require auth
    +layout.server.ts       redirects to /login if no session
    +layout.svelte          app chrome: header with logo + nav
    +page.server.ts         home page load + 4 form actions
    +page.svelte            home page UI
    past/                   past events list with retroactive attendance editing
    venues/                 venue management (add / edit — no delete)
    profile/                change name or password
```

Login/register/logout are **outside** the `(app)` group and have no auth guard.

---

## Home Page — Data Flow (`(app)/+page.server.ts`)

1. `getNextWednesdayDate()` (from `src/lib/utils.ts`) — returns `YYYY-MM-DD` for the next Wednesday (or today if Wednesday)
2. Upserts the event row into `events` if it doesn't exist yet
3. `Promise.all` fetches: all users, attendance for this event, all venues, venue votes for this event, food orders (only if venue locked)
4. Builds derived maps (attendanceMap, voteCounts, userVote) and returns structured page data

### Form actions on home page
| Action | Behaviour |
|---|---|
| `toggleAttendance` | Upsert `attendance` row — sets yes/no for current user |
| `voteVenue` | Toggle: if user already voted for the same venue → delete vote; otherwise upsert |
| `lockVenue` | Sets `events.locked_venue_id` (only if currently null) |
| `saveOrder` | Upsert `food_orders` — accepts `meal`, `venueId`, and optionally `menuItemId` + `notes` |

All forms use `use:enhance` from `$app/forms` for non-reload submissions.

---

## Visual Identity

Colors derived from the CPC Boozers logo (`src/lib/assets/cpc-boozers.png` — a sports badge with a beer mug):
- **Primary / brand**: `violet-600` (#7c3aed) — matches the logo's purple
- **Accent**: `orange-400` (#fb923c) — matches the logo's warm text colour
- **Backgrounds**: `zinc-950` (page) / `zinc-900` (cards)
- **Borders**: `zinc-800` / `violet-900/40` (header)
- **Attendance yes**: `emerald-500` (kept green for universal UX clarity)

The logo PNG is used as:
- Favicon (via `<link rel="icon">` in root layout)
- Header icon (9×9 circle crop, `rounded-full object-cover`)
- Large logo on login/register screens

---

## Pie-nong Thai Menu Integration — IN PROGRESS

This feature is **partially implemented**. Schema is in place and pushed; the UI is not yet built.

### What's done
- `venue_menu_items` table in schema — pushed to Neon
- `food_orders.menu_item_id` and `food_orders.notes` columns — pushed to Neon
- Seed script at `scripts/seed-menu.ts` — contains the full menu JSON for Pie-nong Thai

### What's not done yet
- The seed script has not been run successfully yet. It looks up the venue by name `"Pie-nong Thai"` — **verify the exact venue name in the DB** (`npm run db:studio`) and update the `VENUE_NAME` constant in the script if needed, then run `npx tsx scripts/seed-menu.ts`
- Home page `+page.server.ts` load function needs updating: when venue is locked, check `venue_menu_items` for that venue and pass grouped menu data to the page
- Home page `+page.svelte` needs a menu picker UI (category accordion + protein chips) that replaces the free-form meal input when a venue with menu items is locked. Free-form + notes field should remain as fallback for venues without a menu
- `saveOrder` action needs updating to accept `menuItemId` and `notes` (schema already supports both; `meal` should be auto-populated as a display string e.g. `"Tom Yam #9 — shrimps — €8.50"`)

### Menu picker UI spec (from `MENU-PLAN.md`)
- Categories as collapsible rows (collapsed by default)
- Each dish shows: menu number, name, description
- Protein versions as tappable chips showing protein + price
- Tapping a chip selects it; selected item shown in a confirmation row at the bottom
- Notes textarea below the selection (shown for both menu and free-form orders)
- Previously saved order is pre-selected on page load (requires fetching `menuItemId` for current user's order in the load function)

---

## Known Quirks / Gotchas

- `date` columns returned from Neon HTTP driver are strings (`YYYY-MM-DD`). `formatEventDate()` in `utils.ts` handles timezone-safe display by appending `T12:00:00Z`.
- The `lockVenue` action uses `eq(events.id, eventId) && isNull(events.lockedVenueId)` — this is a JS `&&` not a Drizzle `and()`, which means the `isNull` guard does not actually apply in SQL. If this causes issues, fix to `and(eq(events.id, eventId), isNull(events.lockedVenueId))` (import `and` is already present in the file).
- `numeric` values from Neon HTTP driver come back as strings — parse with `parseFloat()` before arithmetic.
- The `(app)` route group redirect uses `redirect(303, '/login')` without `throw` — valid in SvelteKit 2 (redirect is no longer thrown).
