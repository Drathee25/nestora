const prisma = require('../prismaClient');

function serialize(property) {
  if (!property) return property;
  let images = [];
  try {
    images = JSON.parse(property.images || '[]');
  } catch {
    images = [];
  }
  return { ...property, images };
}

function prepareData(body) {
  const data = { ...body };
  if (Array.isArray(data.images)) {
    data.images = JSON.stringify(data.images);
  }
  return data;
}

async function listProperties(req, res) {
  const { minPrice, maxPrice, bedrooms } = req.query;
  const where = {};

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (bedrooms) where.bedrooms = { gte: Number(bedrooms) };

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(properties.map(serialize));
}

async function getProperty(req, res) {
  const property = await prisma.property.findUnique({ where: { id: req.params.id } });
  if (!property) return res.status(404).json({ error: 'Not found' });
  res.json(serialize(property));
}

async function createProperty(req, res) {
  const property = await prisma.property.create({ data: prepareData(req.body) });
  res.status(201).json(serialize(property));
}

async function updateProperty(req, res) {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: prepareData(req.body),
    });
    res.json(serialize(property));
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
}

async function deleteProperty(req, res) {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
}

module.exports = { listProperties, getProperty, createProperty, updateProperty, deleteProperty };
