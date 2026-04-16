import { createSession, hashPassword } from '$lib/auth';
import { db } from '$lib/db/index';
import { users } from '$lib/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = (data.get('name') as string).trim();
		const password = data.get('password') as string;

		if (!name) return fail(400, { error: 'Name is required' });
		if (password.length < 6) return fail(400, { error: 'Password must be at least 6 characters' });

		const passwordHash = await hashPassword(password);

		let userId: string;
		try {
			const [user] = await db.insert(users).values({ name, passwordHash }).returning({ id: users.id });
			userId = user.id;
		} catch {
			return fail(400, { error: 'That name is already taken' });
		}

		const sessionId = await createSession(userId);
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 60 * 60 * 24 * 30
		});

		redirect(303, '/');
	}
};
