import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { email, password } = await req.json();
  if (!email || !password) {
    return json({ error: 'Email and password required' }, 400);
  }

  const adminEmail = Netlify.env.get('ADMIN_EMAIL');
  const adminHash = Netlify.env.get('ADMIN_PASSWORD_HASH');
  const jwtSecret = Netlify.env.get('JWT_SECRET');

  if (email !== adminEmail) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await bcrypt.compare(password, adminHash);
  if (!valid) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const token = jwt.sign({ email }, jwtSecret, { expiresIn: '7d' });
  return json({ token });
};

export const config = { path: '/api/auth/login' };
