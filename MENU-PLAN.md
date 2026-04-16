# Menu Integration Plan — Pie-nong Thai

## Goal
Allow members to pick their meal directly from the Pie-nong Thai menu rather than typing free-form text. Other venues without an uploaded menu continue using the existing free-form input.

---

## Schema Changes

### New table: `venue_menu_items`
One row per orderable item version (dish × protein combination). Keeping it flat avoids a category → dish → version hierarchy that would complicate queries.

```
venue_menu_items
  id              uuid     PK
  venue_id        uuid     FK → venues  ON DELETE CASCADE
  category        text                  -- e.g. "Soups", "Dishes with noodles"
  dish_name       text                  -- e.g. "Tom Yam"
  description_en  text     nullable
  menu_number     text                  -- stored as text to handle 4.1, 78.1 etc.
  protein         text                  -- e.g. "chicken", "shrimps", "tofu"
  price_eur       numeric(6,2)
  sort_order      integer               -- controls display order within category
```

### Change to `food_orders`
Add an optional FK so orders placed via the menu picker are linked to the specific item. Free-form orders leave this null.

```
food_orders
  ...existing columns...
  menu_item_id    uuid     nullable  FK → venue_menu_items  ON DELETE SET NULL
  notes           text     nullable  -- optional special requests (e.g. "extra spicy")
```

When `menu_item_id` is set, `meal` is auto-populated from the item's display string  
(e.g. `"Tom Yam #9 — shrimps — €8.50"`) so the order summary works without joins.

---

## Data Loading

Pie-nong Thai menu items are seeded once via a script (`npm run db:seed`). No admin UI needed — menus are infrequently updated and can be re-seeded from the JSON when they change.

On the home page load, when a venue is locked:
- Check if `venue_menu_items` has rows for that venue
- If yes → pass the menu to the page (grouped by category)
- If no → fall back to free-form text input (existing behaviour)

---

## UI — Menu Picker (home page, food order section)

Replaces the free-form text input when a venue with a menu is locked.

```
┌─────────────────────────────┐
│  ORDERING FROM              │
│  Pie-nong Thai   [locked]   │
├─────────────────────────────┤
│  [Starters ▼]               │  ← tappable category row (collapsed by default)
│  [Soups ▼]                  │
│  [Spicy Salads ▼]           │
│  [Rice dishes ▼]            │  ← open by default (most popular)
│    #80  Kaeng Massaman      │
│         coconut milk, dark  │
│         curry, potatoes...  │
│    [tofu €16] [chicken €17] │  ← tapping one selects it
│    [beef €18.50] [shrimps…] │
│                             │
│  [Noodle dishes ▼]          │
├─────────────────────────────┤
│  Your order:                │
│  Kaeng Massaman — chicken   │  ← selected item (shows once picked)
│  Notes: ________________    │  ← optional notes field
│  [Confirm order]            │
└─────────────────────────────┘
```

**Interaction rules:**
- Categories collapsed by default; tap to expand
- Selecting any protein version immediately shows it in the "Your order" summary at the bottom
- Previously saved order is pre-selected when the page loads
- Submitting saves both `meal` (formatted string) and `menu_item_id`
- If user already has an order, show it pre-selected with an "edit" affordance

---

## Implementation Steps

### Step 1 — Schema + seed
- Add `venue_menu_items` table and `food_orders.menu_item_id` / `notes` columns to `src/lib/db/schema.ts`
- Run `npm run db:push`
- Write `scripts/seed-menu.ts` that reads the Pie-nong Thai JSON and inserts rows
- Run the seed script once: `npx tsx scripts/seed-menu.ts`

### Step 2 — Server
- Update `+page.server.ts` load: when venue locked, query `venue_menu_items` for that venue grouped by category
- Update `saveOrder` action to accept `menuItemId` and `notes` in addition to `meal`

### Step 3 — UI
- Build the menu picker inline in `+page.svelte` (within the food order section)
- Show free-form fallback when `menuItems` array is empty

---

## Open Questions

1. **Notes field**: should the notes field also appear for free-form orders, or only for menu orders?
2. **Order summary for past events**: past events already saved as free-form text strings — no migration needed, they display as-is.
3. **Menu updates**: if the menu changes, re-run the seed script. Should existing `menu_item_id` FKs on past orders be preserved (`ON DELETE SET NULL`) or is it fine to delete old items? The plan uses `SET NULL` to preserve the `meal` text string.
