import bcrypt from 'bcryptjs';
import { eq, and, gt } from 'drizzle-orm';
import { db } from './db/index';
import { sessions, users } from './db/schema';

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 30;

export function generateSessionId(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
	const id = generateSessionId();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
	await db.insert(sessions).values({ id, userId, expiresAt });
	return id;
}

export async function validateSession(
	token: string
): Promise<{ id: string; name: string } | null> {
	const result = await db
		.select({ id: users.id, name: users.name })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
		.limit(1);
	return result[0] ?? null;
}

export async function deleteSession(token: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, token));
}
