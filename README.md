# Dynamic Service Business Base

Reusable base product for service-business deployments. The repo bundles:

- a dynamic landing page driven by a typed site-definition model
- a business-admin dashboard for content and booking workflow management
- a Supabase-backed appointment and notification workflow
- deployment scripts for seeding, preflight validation, media cleanup, and repo bootstrap

This base repo is standalone. It is not tied to any builder platform.

## Core Architecture

- `src/types/site.ts`: shared content, package, admin, and section models
- `src/data/siteSeed.ts`: generic fallback seed used when Supabase and local content are absent
- `src/features/site`: site-definition loading, hydration, persistence, and runtime filtering
- `src/features/appointments`: booking requests, notes, status updates, and workflow queries
- `src/features/auth`: admin session handling and route protection
- `src/features/notifications`: browser-side Edge Function invocation
- `src/features/deployment`: deployment bootstrap and read-only preflight helpers
- `src/features/media`: before/after gallery upload and cleanup helpers
- `src/components/landing`: public-site sections
- `src/components/admin`: admin editors constrained by package/add-on rules
- `supabase/migrations`: schema, policies, triggers, and storage setup
- `supabase/functions/process-appointment-notifications`: provider-aware notification delivery

## Runtime Model

The app loads a single `SiteDefinition` and renders the public site from it.

Load order:

1. Supabase tables, when browser env is configured and seeded rows exist
2. localStorage fallback for local development/demo mode
3. the in-repo generic seed in `src/data/siteSeed.ts`

This keeps fallback behavior stable while allowing the same UI to operate before infrastructure is connected.

## Local Development

Requirements:

- Node.js
- npm

Setup:

```sh
git clone https://github.com/christianrodriguezcierpe-design/Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr.git
cd Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr
npm install
npm run dev
```

This repo uses `npm` as the canonical package manager.

To prepare env values for a Supabase-backed deployment:

```sh
cp .env.example .env
```

Fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- provider-specific notification env when the `notifications` add-on is enabled:
  - Postmark: `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM_EMAIL`, optional `POSTMARK_FROM_NAME`
  - SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, optional `SMTP_FROM_NAME`, optional `SMTP_SECURE`

## Scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: create a production build
- `npm run build:dev`: create a development-mode build
- `npm run lint`: run ESLint
- `npm run test`: run the Vitest suite once
- `npm run test:watch`: run Vitest in watch mode
- `npm run preview`: serve the built app locally
- `npm run deployment:bootstrap`: rewrite copied deployment docs and metadata in a deployment workspace
- `npm run site:apply-preset`: upsert the current preset into the configured Supabase project
- `npm run site:preflight`: run a read-only deployment readiness check
- `npm run site:sweep-media`: remove orphaned gallery media from the configured `site-media` bucket

## Deployment Workflow

The canonical deployment procedure lives in `BASE_PRODUCT_DEPLOYMENT_MANUAL.md`.

Deployment-specific repos should not duplicate the full reusable process. They should keep only:

- deployment-specific profile and assumptions
- local UAT / validation notes
- client-specific go / no-go state

High-level flow:

1. Copy or clone the base repo into a deployment workspace.
2. Repoint the deployment repo `origin`.
3. Run `npm run deployment:bootstrap` against that deployment workspace.
4. Customize the fallback seed and any deployment-specific preset content.
5. Create and configure the deployment Supabase project.
6. Apply migrations and deploy the notification Edge Function.
7. Run `npm run site:apply-preset`.
8. Run `npm run site:preflight`.
9. Validate the public site, admin login, booking flow, package-gated content, notifications, and media handling.

Example bootstrap command:

```sh
npm run deployment:bootstrap -- \
  --target-dir ../harbor-service-co \
  --deployment-name harbor-service-co \
  --business-name "Harbor Service Co." \
  --repo-url https://github.com/example/harbor-service-co.git \
  --package-tier base \
  --theme-preset civic-ledger \
  --notification-provider postmark \
  --add-on pricing
```

## Supabase Notes

- Public booking requests are written to `appointment_requests`.
- Notification log rows are queued by database triggers when a request is created or reviewed.
- The admin shell uses Supabase Auth email/password when auth env is configured.
- When browser Supabase env is absent, the admin and booking workflow fall back to local mode.
- When storage env is absent, gallery uploads fall back to data URLs so the editor can still be exercised locally.

## Theme Presets

Controlled public-site styling is selected through `packageConfig.themePreset`.

- `bytefix-pro`: tech-forward direction
- `civic-ledger`: professional service-business direction

## Related Docs

- `BASE_PRODUCT_DEPLOYMENT_MANUAL.md`
- `DECISIONS.md`
- `SESSION_STATE.md`
