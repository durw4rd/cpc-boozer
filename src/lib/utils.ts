/** Returns the next Wednesday's date as YYYY-MM-DD. Returns today if today is Wednesday. */
export function getNextWednesdayDate(): string {
	const now = new Date();
	const day = now.getDay(); // 0=Sun … 3=Wed … 6=Sat
	const daysUntil = (3 - day + 7) % 7;
	const next = new Date(now);
	next.setDate(now.getDate() + daysUntil);
	return next.toISOString().split('T')[0];
}

/** Format a YYYY-MM-DD date string as e.g. "Wednesday, 23 April" */
export function formatEventDate(dateStr: string): string {
	// Use noon UTC to avoid timezone drift
	const d = new Date(dateStr + 'T12:00:00Z');
	return new Intl.DateTimeFormat('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		timeZone: 'UTC'
	}).format(d);
}
