import { defineMiddleware } from 'astro:middleware';

const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/callback'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) return next();
  if (pathname.startsWith('/_astro') || pathname.startsWith('/favicon')) return next();

  const cookie = context.request.headers.get('cookie') ?? '';
  const hasSession = cookie.includes('radix-user=');

  if (!hasSession) {
    return context.redirect('/login');
  }

  // Expose user email to pages via locals
  const match = cookie.match(/radix-user=([^;]+)/);
  if (match) {
    context.locals.userEmail = decodeURIComponent(match[1]);
  }

  return next();
});
