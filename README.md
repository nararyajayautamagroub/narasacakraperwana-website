# NARASA CAKRA PERWANA Website

Website PO Virtual / Virtual Transportation Community NARASA CAKRA PERWANA.

## Implemented
- Next.js App Router + TypeScript
- Responsive dark/red UI
- 7 division directory and detail pages
- Recruitment form with PostgreSQL persistence API
- Events and Fleet API
- News and Gallery pages/API
- Contact form/API
- Prisma PostgreSQL schema and environment template
- Admin dashboard foundation
- SEO metadata, sitemap, robots
- GitHub Actions CI

## Still required before public production
- Admin authentication and RBAC
- Admin CRUD for events, fleet, news and gallery
- Object storage/CDN
- Discord/WhatsApp/email notifications
- Rate limiting/CAPTCHA
- Audit log and database backup
- Production database migration and E2E tests

## Divisions
1. CERMATA INDAH — Pariwisata
2. LENCARA TRANS — Pariwisata
3. CERMATA ABADI — AKAP/AKDP & Bus Karyawan
4. NUSAMATA INDAH — AKAP/AKDP & Bus Karyawan
5. CERMATA PRIMA AIRWAYS — Pesawat
6. CERMATA UTAMA GROUB — Kapal
7. CERMATA CARGO GROUB — Expedisi

## Setup
1. Copy .env.example to .env.
2. Set DATABASE_URL.
3. Run npm install.
4. Run npx prisma generate.
5. Run npm run db:push.
6. Run npm run db:seed when seed data is available.
7. Run npm run dev.

Never commit secrets, tokens, passwords, webhook URLs, or .env files.