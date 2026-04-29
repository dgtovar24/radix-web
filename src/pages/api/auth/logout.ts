import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('radix-user', { path: '/' });
  cookies.delete('session', { path: '/' });

  return redirect('/login', 302);
};
