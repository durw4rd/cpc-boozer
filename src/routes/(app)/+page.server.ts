import { db } from '$lib/db/index';
import { attendance, events, foodOrders, users, venueVotes, venueMenuItems, venues } from '$lib/db/schema';
import type { VenueMenuItem } from '$lib/db/schema';
import { getNextWednesdayDate } from '$lib/utils';
import { and, eq, isNull } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const dateStr = getNextWednesdayDate();
	const currentUser = locals.user!;

	// Get or create next Wednesday event
	let event = await db.query.events.findFirst({ where: eq(events.date, dateStr) });
	if (!event) {
		[event] = await db.insert(events).values({ date: dateStr }).returning();
	}

	const [allUsers, attendanceRows, allVenues, voteRows, orderRows, menuItemRows] = await Promise.all([
		db.select({ id: users.id, name: users.name }).from(users).orderBy(users.name),
		db.select().from(attendance).where(eq(attendance.eventId, event.id)),
		db.select().from(venues).orderBy(venues.name),
		db.select().from(venueVotes).where(eq(venueVotes.eventId, event.id)),
		event.lockedVenueId
			? db
					.select({ userId: foodOrders.userId, meal: foodOrders.meal, userName: users.name, menuItemId: foodOrders.menuItemId, notes: foodOrders.notes })
					.from(foodOrders)
					.innerJoin(users, eq(foodOrders.userId, users.id))
					.where(eq(foodOrders.eventId, event.id))
			: Promise.resolve([]),
		event.lockedVenueId
			? db.select().from(venueMenuItems).where(eq(venueMenuItems.venueId, event.lockedVenueId)).orderBy(venueMenuItems.sortOrder)
			: Promise.resolve([] as VenueMenuItem[])
	]);

	const attendanceMap = new Map(attendanceRows.map((a) => [a.userId, a.attending]));
	const voteCounts = voteRows.reduce(
		(acc, v) => acc.set(v.venueId, (acc.get(v.venueId) ?? 0) + 1),
		new Map<string, number>()
	);
	const userVote = voteRows.find((v) => v.userId === currentUser.id)?.venueId ?? null;

	// Group menu items by category for the UI
	const menuByCategory = menuItemRows.reduce(
		(acc, item) => {
			if (!acc[item.category]) acc[item.category] = [];
			acc[item.category].push(item);
			return acc;
		},
		{} as Record<string, VenueMenuItem[]>
	);

	const myOrder = orderRows.find((o) => o.userId === currentUser.id);

	return {
		event,
		members: allUsers.map((u) => ({
			id: u.id,
			name: u.name,
			attending: attendanceMap.get(u.id) ?? null
		})),
		currentUserAttending: attendanceMap.get(currentUser.id) ?? null,
		venues: allVenues.map((v) => ({
			...v,
			voteCount: voteCounts.get(v.id) ?? 0,
			myVote: userVote === v.id
		})),
		currentUserVote: userVote,
		lockedVenue: event.lockedVenueId
			? (allVenues.find((v) => v.id === event.lockedVenueId) ?? null)
			: null,
		foodOrders: orderRows,
		currentUserOrder: myOrder?.meal ?? null,
		currentUserMenuItemId: myOrder?.menuItemId ?? null,
		currentUserNotes: myOrder?.notes ?? null,
		menuByCategory,
		hasMenu: menuItemRows.length > 0
	};
};

export const actions: Actions = {
	toggleAttendance: async ({ request, locals }) => {
		const data = await request.formData();
		const eventId = data.get('eventId') as string;
		const attending = data.get('attending') === 'true';
		await db
			.insert(attendance)
			.values({ eventId, userId: locals.user!.id, attending })
			.onConflictDoUpdate({
				target: [attendance.eventId, attendance.userId],
				set: { attending, updatedAt: new Date() }
			});
	},

	voteVenue: async ({ request, locals }) => {
		const data = await request.formData();
		const eventId = data.get('eventId') as string;
		const venueId = data.get('venueId') as string;
		const userId = locals.user!.id;

		const existing = await db
			.select({ venueId: venueVotes.venueId })
			.from(venueVotes)
			.where(and(eq(venueVotes.eventId, eventId), eq(venueVotes.userId, userId)))
			.limit(1);

		if (existing[0]?.venueId === venueId) {
			// Clicking your current vote removes it
			await db
				.delete(venueVotes)
				.where(and(eq(venueVotes.eventId, eventId), eq(venueVotes.userId, userId)));
		} else {
			// Vote for a new venue (or change from another)
			await db
				.insert(venueVotes)
				.values({ eventId, venueId, userId })
				.onConflictDoUpdate({
					target: [venueVotes.eventId, venueVotes.userId],
					set: { venueId }
				});
		}
	},

	lockVenue: async ({ request }) => {
		const data = await request.formData();
		const eventId = data.get('eventId') as string;
		const venueId = data.get('venueId') as string;
		await db
			.update(events)
			.set({ lockedVenueId: venueId })
			.where(eq(events.id, eventId) && isNull(events.lockedVenueId));
	},

	saveOrder: async ({ request, locals }) => {
		const data = await request.formData();
		const eventId = data.get('eventId') as string;
		const venueId = data.get('venueId') as string;
		const menuItemId = (data.get('menuItemId') as string | null) || null;
		const notes = ((data.get('notes') as string | null) ?? '').trim() || null;
		const meal = (data.get('meal') as string).trim();
		if (!meal) return;
		await db
			.insert(foodOrders)
			.values({ eventId, venueId, userId: locals.user!.id, meal, menuItemId, notes })
			.onConflictDoUpdate({
				target: [foodOrders.eventId, foodOrders.userId],
				set: { meal, venueId, menuItemId, notes }
			});
	}
};
