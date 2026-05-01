import type { APIRoute } from 'astro';

const API_BASE = import.meta.env.PUBLIC_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/v2' : 'https://api.raddix.pro/v1');

const proxy: APIRoute = async ({ params, request, cookies }) => {
  const path = params.path ?? '';
  const targetUrl = new URL(`${API_BASE}/api/${path}`);
  const sourceUrl = new URL(request.url);
  targetUrl.search = sourceUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const userCookie = cookies.get('radix-user')?.value;
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const token = user.token || user.id;
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch {}
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'No se pudo conectar con la API' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
