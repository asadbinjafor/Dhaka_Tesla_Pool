import { randomUUID } from 'node:crypto';
import { readBoundedBody } from '../../../../lib/gateway';

export const dynamic = 'force-dynamic';
const requestHeaderNames = ['cookie', 'content-type', 'accept', 'origin', 'x-csrf-token', 'idempotency-key'];
const responseHeaderNames = ['content-type', 'retry-after', 'www-authenticate'];

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const outputHeaders = new Headers({ 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' });
  const { path } = await context.params;
  if (!path.length || path.some(segment => !/^[a-zA-Z0-9_-]+$/.test(segment))) {
    return Response.json({ error: { code: 'INVALID_INPUT' } }, { status: 400, headers: outputHeaders });
  }
  const headers = new Headers();
  for (const name of requestHeaderNames) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('x-request-id', randomUUID());
  try {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await readBoundedBody(request, 65536);
    if (body === null) return Response.json({ error: { code: 'INVALID_INPUT' } }, { status: 413, headers: outputHeaders });
    const base = process.env.API_INTERNAL_ORIGIN ?? 'http://127.0.0.1:3001';
    const target = new URL(`/api/v1/${path.join('/')}${new URL(request.url).search}`, base);
    const response = await fetch(target, { method: request.method, headers, body, cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(5000) });
    for (const name of responseHeaderNames) {
      const value = response.headers.get(name);
      if (value) outputHeaders.set(name, value);
    }
    for (const cookie of response.headers.getSetCookie()) outputHeaders.append('Set-Cookie', cookie);
    return new Response(response.body, { status: response.status, headers: outputHeaders });
  } catch {
    return Response.json({ error: { code: 'TEMPORARILY_UNAVAILABLE' } }, { status: 503, headers: outputHeaders });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE, forward as PUT, forward as HEAD };
