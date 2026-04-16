import { writable } from 'svelte/store';

export const pending = writable(false);

/** Drop-in use:enhance handler that sets the global pending state. */
export function withPending() {
	pending.set(true);
	return async ({ update }: { update: () => Promise<void> }) => {
		try {
			await update();
		} finally {
			pending.set(false);
		}
	};
}
