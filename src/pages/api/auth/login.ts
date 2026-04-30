import type { APIRoute } from 'astro';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'https://api.raddix.pro/v2';

export const POST: APIRoute = async ({ request, cookies }) => {
  let email = '';
  let password = '';

  try {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Formato de solicitud inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email y contraseña requeridos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Hardcoded Admin Check
  if (email === 'Radix' && password === 'radixelmejor1') {
    const adminUser = { role: 'ADMIN', firstName: 'Admin Radix', id: 0, token: 'admin-hardcoded-token', email: 'Radix' };
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

  const normalizedRole = String(data.role || '').toLowerCase();
  const allowedRoles = ['admin', 'doctor', 'facultativo', 'desarrollador', 'developer'];
  if (!allowedRoles.includes(normalizedRole)) {
    return new Response(JSON.stringify({ error: 'Acceso denegado. Solo personal autorizado.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Store user object in a cookie as the session identifier
  const role = normalizedRole === 'doctor'
    ? 'FACULTATIVO'
    : normalizedRole === 'developer'
      ? 'DESARROLLADOR'
      : String(data.role || '').toUpperCase();

  cookies.set('radix-user', encodeURIComponent(JSON.stringify({ email, ...data, role })), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    secure: import.meta.env.PROD,
  });

  return new Response(JSON.stringify({ success: true, user: { ...data, role } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
