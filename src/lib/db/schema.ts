import { pgTable, uuid, text, boolean, timestamp, date, unique, numeric, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull()
});

export const venues = pgTable('venues', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	description: text('description'),
	url: text('url'),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const events = pgTable('events', {
	id: uuid('id').primaryKey().defaultRandom(),
	date: date('date').notNull().unique(),
	label: text('label'),
	lockedVenueId: uuid('locked_venue_id').references(() => venues.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const attendance = pgTable(
	'attendance',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		attending: boolean('attending').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(t) => [unique().on(t.eventId, t.userId)]
);

export const venueVotes = pgTable(
	'venue_votes',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		venueId: uuid('venue_id')
			.notNull()
			.references(() => venues.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => [unique().on(t.eventId, t.userId)]
);

export const venueMenuItems = pgTable('venue_menu_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	venueId: uuid('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	category: text('category').notNull(),
	dishName: text('dish_name').notNull(),
	descriptionEn: text('description_en'),
	menuNumber: text('menu_number').notNull(),
	protein: text('protein').notNull(),
	priceEur: numeric('price_eur', { precision: 6, scale: 2 }).notNull(),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const foodOrders = pgTable(
	'food_orders',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		venueId: uuid('venue_id')
			.notNull()
			.references(() => venues.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		meal: text('meal').notNull(),
		menuItemId: uuid('menu_item_id').references(() => venueMenuItems.id, {
			onDelete: 'set null'
		}),
		notes: text('notes'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => [unique().on(t.eventId, t.userId)]
);

export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type VenueVote = typeof venueVotes.$inferSelect;
export type VenueMenuItem = typeof venueMenuItems.$inferSelect;
export type FoodOrder = typeof foodOrders.$inferSelect;
