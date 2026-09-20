# NARASA CAKRA PERWANA Website

Website PO Virtual / Virtual Transportation Community NARASA CAKRA PERWANA.

## Implemented

- Next.js App Router + TypeScript
- White background + pink accent visual system
- Light, consistent shadows
- Animated pink buttons with hover, shine, press, focus and disabled states
- Responsive navigation with working `=` hamburger menu
- 7 official division directory + detail pages
- Recruitment form -> validation -> API -> PostgreSQL
- Events and Fleet pages read operational database
- News, Gallery, Contact
- Prisma schema + seed
- Live GitHub repository monitor
- Public repository metadata + latest commit + GitHub Actions status
- Admin-only repository view for authenticated GitHub-owned repositories
- Runtime error page, loading state, 404 page, health endpoint
- GitHub Actions CI

## Data accuracy policy

The site does not treat fabricated member totals, fleet IDs, event schedules, or news as real operational facts.

Initial seed data contains only the known division structure and simulator mapping. Member counts, fleet records, events, and other operational values remain empty until entered or synchronized from a real source.

GitHub project data is read directly from the GitHub API. Public pages expose public repository metadata only. Private repository metadata is server-side/admin-only and requires a configured GitHub token.

## GitHub connection

Environment:

- `GITHUB_OWNER`
- `GITHUB_TOKEN`
- `GITHUB_SYNC_KEY`

Without `GITHUB_TOKEN`, public pages read public repositories from the configured owner. With the token, server-side admin tooling can include owned private repositories.

GitHub data uses short server-side caching to reduce API traffic while keeping the project monitor current.

## Admin security

Environment:

- `ADMIN_PASSWORD`
- `ADMIN_SECRET`

Admin authentication uses an HttpOnly session cookie. Never commit secrets, .env files, tokens, passwords, webhook URLs, or database credentials.

## Database

Environment:

- `DATABASE_URL`

Commands:

```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

## CI

GitHub Actions runs:

1. install dependencies
2. Prisma client generation
3. ESLint
4. Next.js production build

Prisma is pinned to a stable 7.x release instead of `latest` to keep the CLI deterministic in CI. Prisma documents `prisma generate` as the command for generating Prisma Client artifacts. citeturn591699search0turn591699search1
