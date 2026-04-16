import { db } from '$lib/db/index';
import { venues } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allVenues = await db.select().from(venues).orderBy(venues.name);
	return { venues: allVenues };
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const data = await request.formData();
		const name = (data.get('name') as string).trim();
		const description = (data.get('description') as string | null)?.trim() || null;

		if (!name) return fail(400, { error: 'Name is required' });

		try {
			await db.insert(venues).values({ name, description, createdBy: locals.user!.id });
		} catch {
			return fail(400, { error: 'A venue with that name already exists' });
		}
	},

	edit: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = (data.get('name') as string).trim();
		const description = (data.get('description') as string | null)?.trim() || null;

		if (!name) return fail(400, { error: 'Name is required' });

		try {
			await db.update(venues).set({ name, description }).where(eq(venues.id, id));
		} catch {
			return fail(400, { error: 'A venue with that name already exists' });
		}
	}
};
