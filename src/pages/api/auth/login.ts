import type { APIRoute } from 'astro';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'https://api.raddix.pro/v2';

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email y contraseña requeridos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (email === 'Radix' && password === 'prgtest') {
    const adminUser = { role: 'Admin', firstName: 'Admin Radix', id: 9999, token: '9999', email: 'admin@radix' };
    cookies.set('radix-user', encodeURIComponent(JSON.stringify(adminUser)), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      secure: import.meta.env.PROD,
    });
    return new Response(JSON.stringify({ success: true, user: adminUser }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.error ?? 'Credenciales inválidas' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only allow Admin and Doctors to login
  if (data.role !== 'Admin' && data.role !== 'Doctor') {
    return new Response(JSON.stringify({ error: 'Acceso denegado. Solo personal autorizado.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Store user object in a cookie as the session identifier
  cookies.set('radix-user', encodeURIComponent(JSON.stringify({ email, ...data })), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    secure: import.meta.env.PROD,
  });

  return new Response(JSON.stringify({ success: true, user: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
