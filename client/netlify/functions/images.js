import { getStore } from '@netlify/blobs';

export default async (req) => {
  const url = new URL(req.url);
  const key = url.pathname.replace(/^\/api\/images\//, '');
  if (!key) return new Response('Not found', { status: 404 });

  const store = getStore('property-images');
  const result = await store.getWithMetadata(key, { type: 'arrayBuffer' });
  if (!result) return new Response('Not found', { status: 404 });

  const contentType = result.metadata?.contentType || 'application/octet-stream';
  return new Response(result.data, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

export const config = { path: '/api/images/*' };
