# Real Estate Listing Website

React + Three.js (react-three-fiber) + Lenis frontend, Node/Express + Prisma/Postgres backend.

## Project structure

```
/client   React frontend (Vite)
/server   Node/Express API + Prisma
```

## Local setup

### 1. Database
Create a free Postgres database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
Copy the connection string into `server/.env` as `DATABASE_URL`.

### 2. Server
```
cd server
npm install
npx prisma migrate dev --name init
npm run seed        # creates the admin user from ADMIN_EMAIL/ADMIN_PASSWORD in .env
npm run dev          # runs on http://localhost:4000
```

Set these in `server/.env`:
- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — any long random string
- `CLIENT_ORIGIN` — your frontend URL (`http://localhost:5173` locally)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from a free [Cloudinary](https://cloudinary.com) account, used for admin image uploads
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials seeded as the admin login (change after first login if desired)

### 3. Client
```
cd client
npm install
npm run dev          # runs on http://localhost:5173
```

Set these in `client/.env`:
- `VITE_API_URL` — `http://localhost:4000/api` locally, your deployed API URL in production
- `VITE_FORMSPREE_ID` — your form ID from [Formspree](https://formspree.io) (free tier), used by the Contact page

## Deployment (budget setup)

1. **Domain**: buy at GoDaddy.
2. **Frontend**: deploy `/client` to [Vercel](https://vercel.com) (free tier). Set `VITE_API_URL` and `VITE_FORMSPREE_ID` as project env vars. Once deployed, add your GoDaddy domain as a custom domain in Vercel and update GoDaddy's DNS records as Vercel instructs (A/CNAME).
3. **Backend**: deploy `/server` to [Render](https://render.com) (free tier web service). Set all the env vars listed above. After deploy, set `CLIENT_ORIGIN` to your live Vercel domain and `VITE_API_URL` on the client to the Render API URL.
4. **Database**: use the same Neon/Supabase Postgres instance from local setup, or provision a fresh one for production.
5. Run `npx prisma migrate deploy` and `npm run seed` once against the production database (can be done via Render's shell or locally with the production `DATABASE_URL`).

## Admin panel

Visit `/admin/login` with the seeded admin credentials to add, edit, or delete property listings, including image uploads.
