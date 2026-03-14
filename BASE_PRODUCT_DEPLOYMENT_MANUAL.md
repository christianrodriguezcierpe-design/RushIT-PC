# Base Product Deployment Manual

This manual is the canonical deployment procedure for creating a client-specific repo from the base product.

## Goal

Create a deployment workspace that:

- has its own Git remote and package name
- contains deployment-specific docs and metadata
- points at a dedicated Supabase project
- has the current preset seeded into Supabase
- passes preflight before live validation

This manual is the reusable source of truth. Deployment repos created from this base product should keep only a local overlay for:

- deployment-specific profile choices
- local UAT / validation sheets
- client-specific sign-off notes

## Prerequisites

- Node.js and npm installed
- access to the base product repo
- a target GitHub repo for the deployment
- a dedicated Supabase project for the deployment
- provider credentials if the `notifications` add-on will be enabled

## 1. Create the Deployment Workspace

Use either a copy of the base repo or a fresh clone into a new directory.

Recommended branch hygiene:

```sh
git switch main
git pull
git switch -c chore/bootstrap-deployment
```

If the deployment workspace was copied from the base repo, repoint `origin` before bootstrapping:

```sh
git remote set-url origin https://github.com/example/client-deployment.git
git remote -v
```

## 2. Bootstrap the Deployment Repo

Run the bootstrap command from the base repo against the deployment workspace:

```sh
npm run deployment:bootstrap -- \
  --target-dir ../client-deployment \
  --deployment-name client-deployment \
  --business-name "Client Deployment" \
  --repo-url https://github.com/example/client-deployment.git \
  --package-tier base \
  --theme-preset civic-ledger \
  --notification-provider postmark
```

Optional add-ons can be repeated or comma-separated:

```sh
--add-on pricing --add-on team
```

The bootstrap command writes:

- `README.md`
- `DECISIONS.md`
- `SESSION_STATE.md`
- `deployment.config.json`

It also normalizes the deployment package name in `package.json` and `package-lock.json`.

It refuses to run against the base-product workspace itself.

## 3. Customize Deployment Content

Before connecting a live client:

- replace the generic fallback seed in `src/data/siteSeed.ts`
- update any placeholder media alt text and section copy
- confirm the intended theme preset
- confirm the selected package tier and add-ons

Placeholder content should stay conservative until the real business confirms it. Avoid operational promises such as same-day or emergency service unless they are explicitly part of the deployment's agreed offer.

Do not move package/add-on activation into the client admin. That remains controlled by deployment config and preset application.

Normal business content should be editable from the admin after deployment. A deployment should not depend on source-code edits for routine business copy changes.

## 4. Configure Supabase

Create a dedicated Supabase project for the deployment.

Then configure env values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

If notifications are enabled:

- Postmark:
  - `POSTMARK_SERVER_TOKEN`
  - `POSTMARK_FROM_EMAIL`
  - optional `POSTMARK_FROM_NAME`
- SMTP:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USERNAME`
  - `SMTP_PASSWORD`
  - `SMTP_FROM_EMAIL`
  - optional `SMTP_FROM_NAME`
  - optional `SMTP_SECURE`

## 5. Apply Migrations

Apply these SQL files to the deployment Supabase project in order:

1. `supabase/migrations/20260311152000_site_foundation.sql`
2. `supabase/migrations/20260311170000_appointment_workflow.sql`
3. `supabase/migrations/20260311184500_business_admin_content_updates.sql`
4. `supabase/migrations/20260311193000_notification_delivery_addon.sql`
5. `supabase/migrations/20260313103000_site_media_storage.sql`
6. `supabase/migrations/20260313121500_notification_provider_smtp.sql`

## 6. Deploy the Edge Function

Deploy:

- `supabase/functions/process-appointment-notifications`

This function is required when the `notifications` add-on is enabled. It processes queued `notification_logs` rows and sends email through the selected provider.

## 7. Create the Business Admin User

In the target Supabase project:

- create the business admin user in Supabase Auth
- use email/password credentials

The admin UI uses local mode only when browser Supabase auth is not configured.

## 8. Seed the Preset

From the deployment repo:

```sh
npm install
npm run site:apply-preset
```

This upserts:

- `business_profile`
- `deployment_config`
- `fixed_section_content`
- `managed_section_content`

## 9. Run Preflight

From the deployment repo:

```sh
npm run site:preflight
```

Preflight is read-only. It verifies:

- browser Supabase env
- service-role Supabase env
- required core tables
- seeded site-definition rows
- `site-media` bucket readiness when `beforeAfterGallery` is enabled
- provider-specific notification env when `notifications` is enabled
- notification Edge Function reachability when `notifications` is enabled

Do not skip this step before live validation.

## 10. Validate the Deployment

Minimum validation checklist:

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. Start the app with `npm run dev`
5. Confirm the public site loads from Supabase-backed content
6. Submit a booking request
7. Sign in at `/admin`
8. Review the request queue, add a note, and accept or reject a request
9. Validate package-gated editors and section ordering
10. If enabled, validate gallery uploads and notification delivery

## Validation Standard For Base Product Sign-Off

The base product should only be considered validated through a real deployment if all of the following are true:

- the deployment can be created from this base process without undocumented side steps
- it runs on its own Supabase project cleanly
- public site content is deployment-managed
- the business admin can operate the active site scope without code edits
- the request pipeline works end to end
- notifications work when enabled
- no hidden manual fixes are required after deployment
- issues found during validation are either fixed in the base product or documented as known non-blockers

## 11. Media Cleanup

For abandoned or replaced gallery uploads:

```sh
npm run site:sweep-media -- --dry-run
npm run site:sweep-media
```

Only run the non-dry-run command after confirming the removal list.

## 12. Release and Handoff

Before handoff:

- commit the bootstrapped deployment state
- document deployment-specific decisions in the deployment repo
- record the final theme preset, provider choice, add-ons, and validation status
- confirm who owns the provider credentials and Supabase project access

## Operational Notes

- Each deployment should use its own Supabase project.
- Base deployments still create `notification_logs` even when notifications are disabled; those rows are marked `skipped`.
- Footer content is derived from business profile data and active managed sections in V1.
- Package activation and locked section positions remain outside the client admin surface.
