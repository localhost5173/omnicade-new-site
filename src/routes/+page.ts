// The marketing page is the only prerendered route; everything under
// /login, /account, /claim, /m/... is server-rendered (session cookie +
// server-side api proxy).
export const prerender = true;
