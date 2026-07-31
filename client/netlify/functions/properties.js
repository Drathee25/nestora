import { getDatabase } from '@netlify/database';
import jwt from 'jsonwebtoken';

const db = getDatabase();

function toCamel(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.area_sqft,
    images: row.images,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

function json(data, status = 200) {
  return new Response(data === null ? null : JSON.stringify(data), {
    status,
    headers: data === null ? {} : { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/properties\/?/, '').split('/').filter(Boolean);
  const id = parts[0];

  if (req.method === 'GET' && !id) {
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const bedrooms = url.searchParams.get('bedrooms');

    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    if (minPrice) {
      params.push(Number(minPrice));
      query += ` AND price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      query += ` AND price <= $${params.length}`;
    }
    if (bedrooms) {
      params.push(Number(bedrooms));
      query += ` AND bedrooms >= $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';

    const rows = await db.sql.unsafe(query, params);
    return json(rows.map(toCamel));
  }

  if (req.method === 'GET' && id) {
    const rows = await db.sql`SELECT * FROM properties WHERE id = ${id}`;
    if (!rows[0]) return json({ error: 'Not found' }, 404);
    return json(toCamel(rows[0]));
  }

  const admin = requireAuth(req);
  if (!admin) return json({ error: 'Unauthorized' }, 401);

  if (req.method === 'POST') {
    const body = await req.json();
    const [row] = await db.sql`
      INSERT INTO properties (title, description, price, address, lat, lng, bedrooms, bathrooms, area_sqft, images, status)
      VALUES (${body.title}, ${body.description}, ${body.price}, ${body.address}, ${body.lat ?? null}, ${body.lng ?? null}, ${body.bedrooms}, ${body.bathrooms}, ${body.areaSqft}, ${JSON.stringify(body.images || [])}::jsonb, ${body.status || 'available'})
      RETURNING *
    `;
    return json(toCamel(row), 201);
  }

  if (req.method === 'PUT' && id) {
    const body = await req.json();
    const [row] = await db.sql`
      UPDATE properties SET
        title = ${body.title},
        description = ${body.description},
        price = ${body.price},
        address = ${body.address},
        lat = ${body.lat ?? null},
        lng = ${body.lng ?? null},
        bedrooms = ${body.bedrooms},
        bathrooms = ${body.bathrooms},
        area_sqft = ${body.areaSqft},
        images = ${JSON.stringify(body.images || [])}::jsonb,
        status = ${body.status || 'available'},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!row) return json({ error: 'Not found' }, 404);
    return json(toCamel(row));
  }

  if (req.method === 'DELETE' && id) {
    const rows = await db.sql`DELETE FROM properties WHERE id = ${id} RETURNING id`;
    if (!rows[0]) return json({ error: 'Not found' }, 404);
    return json(null, 204);
  }

  return json({ error: 'Not found' }, 404);
};

export const config = { path: ['/api/properties', '/api/properties/*'] };
