import { db } from '$lib/db/index';
import { users } from '$lib/db/schema';
import { hashPassword, verifyPassword } from '$lib/auth';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user! };
};

export const actions: Actions = {
	changeName: async ({ request, locals }) => {
		const data = await request.formData();
		const name = (data.get('name') as string).trim();

		if (!name) return fail(400, { nameError: 'Name cannot be empty' });

		try {
			await db.update(users).set({ name }).where(eq(users.id, locals.user!.id));
		} catch {
			return fail(400, { nameError: 'That name is already taken' });
		}

		return { nameSuccess: true };
	},

	changePassword: async ({ request, locals }) => {
		const data = await request.formData();
		const current = data.get('current') as string;
		const next = data.get('next') as string;

		if (!next || next.length < 6) {
			return fail(400, { passwordError: 'New password must be at least 6 characters' });
		}

		const [user] = await db
			.select({ passwordHash: users.passwordHash })
			.from(users)
			.where(eq(users.id, locals.user!.id))
			.limit(1);

		const valid = await verifyPassword(current, user.passwordHash);
		if (!valid) return fail(400, { passwordError: 'Current password is incorrect' });

		const hash = await hashPassword(next);
		await db.update(users).set({ passwordHash: hash }).where(eq(users.id, locals.user!.id));

		return { passwordSuccess: true };
	}
};
