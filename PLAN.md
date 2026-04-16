# Boozer — App Plan

A mobile-first web app for organizing weekly Wednesday get-togethers: who's coming for drinks, and who wants in on a collective food order.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | SvelteKit | Svelte + routing + SSR/API routes in one package; deploys to Vercel natively |
| Database | Neon DB (PostgreSQL) | Free tier on Vercel, serverless-friendly |
| ORM | Drizzle ORM | Lightweight, type-safe, works well with Neon's HTTP driver |
| Auth | Lucia v3 | Purpose-built for SvelteKit sessions; simple username/password, no OAuth complexity |
| Styling | Tailwind CSS | Utility-first, easy mobile-first layout |
| Deployment | Vercel | Native SvelteKit adapter, connects to Neon via env vars |

---

## Data Model

```
users
  id            uuid  PK
  name          text  unique   -- single name used for both login and display
  password_hash text
  created_at    timestamp

events
  id            uuid  PK
  date          date  unique   -- always a Wednesday
  label         text  nullable -- optional e.g. "Easter edition"
  created_at    timestamp

attendance
  id            uuid  PK
  event_id      uuid  FK → events
  user_id       uuid  FK → users
  attending     bool
  created_at    timestamp
  updated_at    timestamp      -- retroactive updates allowed
  UNIQUE (event_id, user_id)

venues
  id            uuid  PK
  name          text  unique
  description   text  nullable
  created_by    uuid  FK → users
  created_at    timestamp

venue_votes
  id            uuid  PK
  event_id      uuid  FK → events
  venue_id      uuid  FK → venues
  user_id       uuid  FK → users
  created_at    timestamp
  UNIQUE (event_id, user_id)   -- one vote per person per event

food_orders
  id            uuid  PK
  event_id      uuid  FK → events
  venue_id      uuid  FK → venues  -- denotes which venue they're ordering from
  user_id       uuid  FK → users
  meal          text               -- free-form
  created_at    timestamp
  UNIQUE (event_id, user_id)
```

**Venue selection flow**: attendees vote for their preferred venue. The venue with the most votes is highlighted as the leading choice. Once consensus is clear (or someone decides to go with it), anyone can lock in the venue for food ordering — at which point the meal input opens up for all users. Locking is a lightweight action, not a separate role.

Events are auto-generated: the next upcoming Wednesday is always available. When Wednesday passes, the following Wednesday is created automatically.

---

## Application Structure

```
src/
  lib/
    db/
      schema.ts          -- Drizzle schema definitions
      index.ts           -- Neon + Drizzle client
    auth/
      index.ts           -- Lucia setup
    components/
      AttendanceToggle.svelte
      VenueSelector.svelte
      FoodOrderForm.svelte
      PastEventsList.svelte
  routes/
    /                    -- home: next upcoming event (attendance + food order)
    /past                -- past events list (opt-in view)
    /venues              -- venue management (add/edit)
    /login
    /register
    /profile             -- change name or password
  hooks.server.ts        -- Lucia session validation
```

---

## Key Screens (mobile-first)

### Home — Next Wednesday
The entire home screen is focused on a single event: the next upcoming Wednesday. It shows:
- Date and optional label
- **Attendance section**: list of all members with their yes/no status; current user can toggle (updates are allowed retroactively for past events too)
- **Food order section**: venue vote tally + meal summary once a venue is locked

Everything in the app is visible to all logged-in users — no private data.

A small "past events" link at the bottom allows optional browsing of history.

### Past Events
List of previous Wednesdays, each expandable to show who came and what was ordered. Users can still update their own attendance retroactively.

### Venue Management (`/venues`)
- List of all saved venues (name + optional description)
- Any logged-in user can add a new venue or edit an existing one
- No deletion (to preserve food order history integrity)

### Home — Food Order Flow
1. **Vote**: any attending member can cast a vote for their preferred venue; vote counts are shown live next to each option; users can change their vote
2. **Lock**: once there's a clear winner (or group consensus), any user can lock the venue for the event — this opens the meal input
3. **Order**: each user types their own free-form meal; they can edit it at any time

### Auth (Login / Register)
- Single name field (used for login and shown in the UI) + password
- No email required
- Session persists via cookie (30-day expiry)

### Profile
- Change name
- Change password

---

## Phases

### Phase 1 — Foundation
- SvelteKit project scaffolding with Tailwind CSS
- Neon DB connection, Drizzle schema, migrations
- Lucia auth: register, login, logout, session middleware
- Auto-generation of next Wednesday event
- Home screen: attendance toggle, full member list with statuses
- Past events view with retroactive attendance editing

### Phase 2 — Food Orders
- Venue management page (add/edit)
- Venue voting per event (cast/change vote, live tally)
- Venue locking (any user can lock; unlocks meal input)
- Meal input per user per event (free-form, editable)
- Collective order summary on home screen
