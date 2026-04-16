# CPC Boozers

A mobile-first web app for organising weekly Wednesday get-togethers: who's coming for drinks, and who wants in on a collective food order.

## Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes mode) |
| Database | Neon DB (serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## Features

- **Attendance** — members mark themselves in or out for the next Wednesday; counts shown live
- **Venue voting** — cast/change a vote for any saved venue; vote counts shown per venue
- **Venue locking** — any user can lock the winning venue, opening the food order phase
- **Menu picker** — venues with an uploaded menu (currently Pie-nong Thai) show a category accordion with per-dish protein buttons; supports multi-select and item deselection
- **Free-form fallback** — venues without a menu get a plain text input
- **Food order notes** — optional special requests per order, visible to everyone
- **Order management** — users can update or remove their own order at any time
- **Venue unlock** — any user can unlock the venue to go back to voting
- **Past events** — browse previous Wednesdays; attendance can be updated retroactively

## Getting started

```bash
npm install
cp .env.example .env   # add your Neon DATABASE_URL
npm run db:push        # apply schema to DB
npx tsx scripts/seed-menu.ts  # seed Pie-nong Thai menu (requires venue to exist in DB)
npm run dev
```

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run check        # TypeScript + Svelte type-check
npm run db:push      # push schema changes to Neon (dev)
npm run db:generate  # generate SQL migration files
npm run db:migrate   # apply migrations
npm run db:studio    # open Drizzle Studio
```

## Project structure

```
src/
  lib/
    auth.ts              — bcrypt + session token helpers
    utils.ts             — getNextWednesdayDate() (UTC-safe), formatEventDate()
    assets/              — cpc-logo.svg, cpc-boozers.png
    db/
      schema.ts          — Drizzle schema + exported types
      index.ts           — Neon + Drizzle client
  routes/
    (app)/               — protected routes (session required)
      +layout.server.ts  — session guard, redirects to /login
      +page.server.ts    — home page load + all actions
      +page.svelte       — home page UI
      past/              — past events list
      venues/            — venue management (add/edit)
      profile/           — change name or password
    login/ register/ logout/
  hooks.server.ts        — validates session cookie, populates locals.user

scripts/
  seed-menu.ts           — seeds Pie-nong Thai menu items into venue_menu_items
```
