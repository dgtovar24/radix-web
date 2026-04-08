import type { APIRoute } from 'astro';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'https://api.raddix.pro/v2';

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/usuarios`);
    const data = await res.json().catch(() => []);

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Error de conexión con el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
