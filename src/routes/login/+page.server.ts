import { createSession, verifyPassword } from '$lib/auth';
import { db } from '$lib/db/index';
import { users } from '$lib/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = (data.get('name') as string).trim();
		const password = data.get('password') as string;

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.name, name))
			.limit(1);

		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return fail(400, { error: 'Invalid name or password' });
		}

		const sessionId = await createSession(user.id);
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
