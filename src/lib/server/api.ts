// Server-side api client: the only place the player pages talk to
// omnicade-api. The session token never reaches browser JS -- it lives in
// an HttpOnly cookie and rides out as a Bearer header from here.
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

export const API_BASE = (env.API_BASE_URL ?? 'http://localhost:8086').replace(/\/$/, '');

export type ApiResult<T> = {
	status: number;
	ok: boolean;
	data: T | null;
	error: string | null;
};

export async function api<T = unknown>(
	path: string,
	opts: { method?: string; token?: string; body?: unknown } = {}
): Promise<ApiResult<T>> {
	const headers: Record<string, string> = {};
	if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
	if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
	try {
		const res = await fetch(API_BASE + path, {
			method: opts.method ?? 'GET',
			headers,
			body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
		});
		const raw = await res.text();
		let data: unknown = null;
		if (raw) {
			try {
				data = JSON.parse(raw);
			} catch {
				data = null;
			}
		}
		const err =
			res.ok ? null : (data as { error?: string } | null)?.error ?? `request failed (${res.status})`;
		return { status: res.status, ok: res.ok, data: data as T, error: err };
	} catch (e) {
		return { status: 0, ok: false, data: null, error: 'the arcade service is unreachable' };
	}
}

// ---- session cookie ----

export const SESSION_COOKIE = 'omnicade_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // mirrors the api's sessionTTL

// cookieSecure is true on https deployments (SITE_BASE_URL says which);
// local dev over http keeps the cookie workable.
const cookieSecure = (env.SITE_BASE_URL ?? '').startsWith('https');

export const sessionCookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: cookieSecure,
	maxAge: SESSION_MAX_AGE
} as const;

// setSession stores the token in the HttpOnly cookie and clearSession
// removes it. Every login/logout/reset goes through these two.
export function setSession(cookies: Cookies, token: string) {
	cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
}
export function clearSession(cookies: Cookies) {
	cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
}

export function sessionFromRequest(cookies: Cookies): string | null {
	const t = cookies.get(SESSION_COOKIE);
	return t && t.startsWith('omcsess_') ? t : null;
}
