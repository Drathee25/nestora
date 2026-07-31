import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requireAuth(req) {
  const header = req.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), Netlify.env.get('JWT_SECRET'));
  } catch {
    return null;
  }
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const admin = requireAuth(req);
  if (!admin) return json({ error: 'Unauthorized' }, 401);

  const formData = await req.formData();
  const file = formData.get('image');
  if (!file || typeof file === 'string') {
    return json({ error: 'No file uploaded' }, 400);
  }

  const buffer = await file.arrayBuffer();
  const ext = file.name && file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const key = `${randomUUID()}.${ext}`;

  const store = getStore('property-images');
  await store.set(key, buffer, { metadata: { contentType: file.type || 'application/octet-stream' } });

  return json({ url: `/api/images/${key}` });
};

export const config = { path: '/api/upload' };
