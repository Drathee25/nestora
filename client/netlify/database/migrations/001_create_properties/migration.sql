CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE properties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       DOUBLE PRECISION NOT NULL,
  address     TEXT NOT NULL,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  bedrooms    INTEGER NOT NULL,
  bathrooms   INTEGER NOT NULL,
  area_sqft   INTEGER NOT NULL,
  images      JSONB NOT NULL DEFAULT '[]',
  status      TEXT NOT NULL DEFAULT 'available',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO properties (title, description, price, address, lat, lng, bedrooms, bathrooms, area_sqft, images, status) VALUES
(
  'Independent Villa in Vasant Vihar',
  'A stately independent villa in one of South Delhi''s most prestigious neighbourhoods. Features a private lawn, marble flooring, modern kitchen, and dedicated parking for three cars.',
  125000000,
  'Vasant Vihar, New Delhi, Delhi 110057',
  28.5588, 77.1591,
  5, 5, 4500,
  '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200","https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"]',
  'available'
),
(
  'Modern Apartment in Greater Kailash',
  'Sun-lit 3BHK apartment in a gated community in GK-1, close to markets, schools, and metro connectivity. Comes with a modular kitchen and covered parking.',
  32500000,
  'Greater Kailash 1, New Delhi, Delhi 110048',
  28.5494, 77.2425,
  3, 3, 2100,
  '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"]',
  'available'
),
(
  'Family Home in Dwarka Sector 12',
  'Spacious builder floor in a quiet, family-friendly sector of Dwarka with easy access to the airport, metro, and Dwarka Expressway. Includes a private terrace.',
  18500000,
  'Sector 12, Dwarka, New Delhi, Delhi 110078',
  28.5921, 77.0460,
  4, 3, 2600,
  '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"]',
  'available'
),
(
  'Premium Studio in Saket',
  'Compact, move-in ready studio apartment near Saket''s malls and metro station. Ideal for working professionals, with 24x7 security and power backup.',
  8500000,
  'Saket, New Delhi, Delhi 110017',
  28.5244, 77.2066,
  1, 1, 650,
  '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"]',
  'sold'
);
