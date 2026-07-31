const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token });
}

module.exports = { login };
