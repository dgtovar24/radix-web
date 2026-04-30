import type { APIRoute } from 'astro';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'https://api.raddix.pro/v2';

export const POST: APIRoute = async ({ request, cookies }) => {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Body must be JSON' }), { status: 400 });
  }

  const { firstName, lastName, email, password, phone, address, role } = body;

  if (!firstName || !lastName || !email || !password) {
    return new Response(JSON.stringify({ error: 'Campos principales son obligatorios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userCookie = cookies.get('radix-user')?.value;
  if (!userCookie) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  let callerToken = '';
  let callerRole = '';
  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    callerRole = String(user.role || '').toLowerCase();
    callerToken = user.token || user.id;
  } catch {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (callerToken) {
    headers['Authorization'] = `Bearer ${callerToken}`;
  }

  let endpoint = `${API_BASE}/api/auth/register/patient`;
  let backendPayload: any = {};

  if (callerRole === 'admin' || callerRole === 'desarrollador' || callerRole === 'developer') {
    endpoint = `${API_BASE}/api/auth/register/doctor`;
    backendPayload = { firstName, lastName, email, password };
  } else if (callerRole === 'doctor' || callerRole === 'facultativo') {
    endpoint = `${API_BASE}/api/auth/register/patient`;
    backendPayload = { firstName, lastName, email, password, phone, address };
  } else {
    return new Response(JSON.stringify({ error: 'Rol no autorizado para registrar' }), { status: 403 });
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error || data.message || 'Error al crear usuario' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Usuario creado', data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error de conexión con el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
