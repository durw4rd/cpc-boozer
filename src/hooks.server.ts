import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	event.locals.user = token ? await validateSession(token) : null;
	return resolve(event);
};
