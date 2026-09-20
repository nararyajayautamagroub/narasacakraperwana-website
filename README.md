# NARASA CAKRA PERWANA Website

Website PO Virtual / Virtual Transportation Community NARASA CAKRA PERWANA.

## Version 4.0

- Responsive white + pink design
- Soft shadows and animated buttons
- Mobile hamburger menu
- 10-language selector
- Account register
- Email/password login
- Google OAuth login
- JWT session
- User dashboard
- Profile/settings
- Password change and password creation for Google-only accounts
- PostgreSQL + Prisma
- Live GitHub project monitor
- Private GitHub repository admin monitor
- HTML/RSS/JSON scraper
- Scraper history + stored items
- Scheduled scraper endpoint
- Admin authentication
- Error, 404 and loading boundaries
- Health endpoint
- ESLint + TypeScript + production build checks

## Ten languages

- 🇮🇩 Bahasa Indonesia
- 🇬🇧 English
- 🇲🇾 Bahasa Melayu
- 🇨🇳 简体中文
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇸🇦 العربية
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch

The selected locale is stored in a browser cookie and, for authenticated users, in PostgreSQL.

## Authentication

Local account:
- Register
- Login
- Logout
- Password hash with bcrypt
- JWT session

Google:
- Google OAuth provider through NextAuth
- Existing Google users are matched by normalized email
- Google-only users can create a local password later in Settings

Required environment:

```env
NEXTAUTH_URL="https://narasacakraperwana.com"
NEXTAUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Google OAuth redirect URIs:

```
https://YOUR-DOMAIN/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

Do not put Google secrets in source control.

## Scraper

Supported:
- HTML/CSS selector
- RSS/XML
- JSON

Safety:
- HTTPS only
- response timeout
- response size limit
- configurable host allowlist
- database persistence
- run history
- dry-run configuration validation

Commands:

```bash
npm run scrape
npm run scrape:check
```

Scheduler endpoint:

`/api/scraper/run`

It requires `CRON_SECRET` or `SCRAPER_RUN_SECRET`.

## GitHub connection

Public website:
- public repository metadata
- commit information when authenticated
- GitHub Actions state when authenticated

Admin:
- can synchronize owned private repositories with `GITHUB_TOKEN`

Private repository information is never rendered on the public project monitor.

## Data policy

Unverified member totals, fleet units, events, and news are not seeded as real facts. Empty operational values remain empty until supplied by an authorized source or admin.

## Local setup

```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run check
npm run dev
```

For full production deployment, set `DATABASE_URL`, NextAuth secrets, Google OAuth credentials, GitHub token, admin secrets, and scraper configuration.
