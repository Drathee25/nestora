require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleImages = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
];

const properties = [
  {
    title: 'Independent Villa in Vasant Vihar',
    description:
      'A stately independent villa in one of South Delhi\'s most prestigious neighbourhoods. Features a private lawn, marble flooring, modern kitchen, and dedicated parking for three cars.',
    price: 125000000,
    address: 'Vasant Vihar, New Delhi, Delhi 110057',
    lat: 28.5588,
    lng: 77.1591,
    bedrooms: 5,
    bathrooms: 5,
    areaSqft: 4500,
    images: JSON.stringify(sampleImages),
    status: 'available',
  },
  {
    title: 'Modern Apartment in Greater Kailash',
    description:
      'Sun-lit 3BHK apartment in a gated community in GK-1, close to markets, schools, and metro connectivity. Comes with a modular kitchen and covered parking.',
    price: 32500000,
    address: 'Greater Kailash 1, New Delhi, Delhi 110048',
    lat: 28.5494,
    lng: 77.2425,
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2100,
    images: JSON.stringify([sampleImages[1], sampleImages[2]]),
    status: 'available',
  },
  {
    title: 'Family Home in Dwarka Sector 12',
    description:
      'Spacious builder floor in a quiet, family-friendly sector of Dwarka with easy access to the airport, metro, and Dwarka Expressway. Includes a private terrace.',
    price: 18500000,
    address: 'Sector 12, Dwarka, New Delhi, Delhi 110078',
    lat: 28.5921,
    lng: 77.0460,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 2600,
    images: JSON.stringify([sampleImages[2], sampleImages[0]]),
    status: 'available',
  },
  {
    title: 'Premium Studio in Saket',
    description:
      'Compact, move-in ready studio apartment near Saket\'s malls and metro station. Ideal for working professionals, with 24x7 security and power backup.',
    price: 8500000,
    address: 'Saket, New Delhi, Delhi 110017',
    lat: 28.5244,
    lng: 77.2066,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 650,
    images: JSON.stringify([sampleImages[0]]),
    status: 'sold',
  },
];

async function main() {
  await prisma.property.deleteMany();
  for (const p of properties) {
    await prisma.property.create({ data: p });
  }
  console.log(`Seeded ${properties.length} properties`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
