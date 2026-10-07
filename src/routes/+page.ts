// No prerendering: the homepage picks its language per request (hook:
// ?lang > cookie > geo header > Accept-Language), and a prerendered page
// is frozen at build time in English. Everything under /login, /account,
// /claim, /m/... is server-rendered too (session cookie + server-side
// api proxy).
export const prerender = false;
