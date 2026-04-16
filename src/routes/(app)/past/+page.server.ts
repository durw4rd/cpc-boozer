import { db } from '$lib/db/index';
import { attendance, events, foodOrders, users, venues } from '$lib/db/schema';
import { getNextWednesdayDate } from '$lib/utils';
import { and, eq, lt } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const today = getNextWednesdayDate();

	const pastEvents = await db
		.select()
		.from(events)
		.where(lt(events.date, today))
		.orderBy(events.date);

	// Reverse so newest first
	pastEvents.reverse();

	const eventIds = pastEvents.map((e) => e.id);
	if (eventIds.length === 0) return { events: [] };

	const [allUsers, attendanceRows, allVenues, orderRows] = await Promise.all([
		db.select({ id: users.id, name: users.name }).from(users),
		db.select().from(attendance),
		db.select().from(venues),
		db
			.select({ eventId: foodOrders.eventId, userId: foodOrders.userId, meal: foodOrders.meal, userName: users.name })
			.from(foodOrders)
			.innerJoin(users, eq(foodOrders.userId, users.id))
	]);

	const venueMap = new Map(allVenues.map((v) => [v.id, v.name]));
	const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

	return {
		events: pastEvents.map((event) => {
			const eventAttendance = attendanceRows.filter((a) => a.eventId === event.id);
			const eventOrders = orderRows.filter((o) => o.eventId === event.id);
			return {
				id: event.id,
				date: event.date,
				label: event.label,
				lockedVenueName: event.lockedVenueId ? (venueMap.get(event.lockedVenueId) ?? null) : null,
				members: allUsers.map((u) => ({
					id: u.id,
					name: u.name,
					attending: eventAttendance.find((a) => a.userId === u.id)?.attending ?? null
				})),
				foodOrders: eventOrders
			};
		})
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
	}
};
