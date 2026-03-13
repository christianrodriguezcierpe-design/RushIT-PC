# Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr

Frontend application scaffold managed in GitHub and editable locally or through Lovable. The repository currently uses Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.

## Current foundation

The landing page now renders from a shared site-definition layer instead of section-local hardcoded arrays and copy.

- Seeded content and package/config defaults live in `src/data/siteSeed.ts`.
- Typed site/content/config models live in `src/types/site.ts`.
- Section ordering and rendering are resolved through `src/features/site`.
- Supabase browser-client scaffolding lives in `src/integrations/supabase`.
- Supabase SQL schema lives in `supabase/migrations`.
- Internal preset apply tooling lives in `scripts/apply-site-preset.ts`.
- Appointment workflow logic lives in `src/features/appointments`.
- Admin auth/session shell lives in `src/features/auth` and `src/pages/admin`.

The pre-validation release-blocker dependency pass is partially complete:

- `react-router-dom` is patched to `6.30.3` to clear the production routing/open-redirect audit finding.
- `lodash` is forced to `4.17.23` through `overrides` so the runtime dependency pulled by `recharts` no longer carries the reported prototype-pollution issue.
- The remaining `npm audit` findings are currently in dev/build/test tooling (`vite`, `rollup`, `esbuild`, `jsdom`, and related transitive packages) and are being deferred until after the first real client validation.

The app now attempts to load the site definition from Supabase tables first and falls back to the in-repo seed definition when env values or database rows are missing. The booking form now creates appointment requests, and `/admin` provides business-admin screens for request handling plus content editors for the business profile, services, pricing when enabled, before/after gallery when enabled, FAQs, reviews, team when enabled, case studies when enabled, and allowed section order.

For V1, the footer is derived automatically from business profile data and active sections rather than managed through a separate footer editor.

The base product also now supports:

- a provider-aware notifications add-on selected through deployment config as `postmark` or `smtp`
- a controlled public-site theme layer selected through `packageConfig.themePreset`

## Repository

- GitHub: `https://github.com/christianrodriguezcierpe-design/Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr.git`
- Default branch: `main`

## Local development

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

To prepare Supabase env values for a client deployment:

```sh
cp .env.example .env
```

Fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- provider-specific notification env when the notifications add-on is enabled:
  - Postmark: `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM_EMAIL`, optional `POSTMARK_FROM_NAME`
  - SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, optional `SMTP_FROM_NAME`, optional `SMTP_SECURE`

## Working on a branch

Use feature or chore branches off `main` for local changes:

```sh
git switch main
git pull
git switch -c <branch-name>
```

Publish a branch when you are ready:

```sh
git push -u origin <branch-name>
```

If the repository is still connected to Lovable, pushed changes will also be reflected there.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run build:dev` creates a development-mode build.
- `npm run lint` runs ESLint.
- `npm run site:apply-preset` upserts the current preset into the configured Supabase project using the service role key.
- `npm run site:preflight` runs a read-only deployment readiness check against the configured Supabase project and local env values.
- `npm run site:sweep-media` removes orphaned gallery media objects from the configured Supabase `site-media` bucket. Add `-- --dry-run` to preview removals.
- `npm run test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run preview` serves the built app locally.

## Supabase setup flow

1. Apply the SQL in `supabase/migrations/20260311152000_site_foundation.sql` to the target client Supabase project.
2. Apply the SQL in `supabase/migrations/20260311170000_appointment_workflow.sql`.
3. Apply the SQL in `supabase/migrations/20260311184500_business_admin_content_updates.sql`.
4. Apply the SQL in `supabase/migrations/20260311193000_notification_delivery_addon.sql`.
5. Apply the SQL in `supabase/migrations/20260313103000_site_media_storage.sql` to provision the public `site-media` bucket and authenticated upload policies.
6. Apply the SQL in `supabase/migrations/20260313121500_notification_provider_smtp.sql` to add notification-provider selection to deployment config and logs.
7. Deploy the Supabase Edge Function in `supabase/functions/process-appointment-notifications`.
8. Create the business admin user in Supabase Auth with email/password credentials.
9. Set the browser and service-role env values.
10. If the notifications add-on is enabled for that client, set the provider-specific notification env for the selected `notification_provider`.
11. Run `npm run site:apply-preset` to upsert the current preset rows.
12. Run `npm run site:preflight` to verify env values, tables, seeded rows, the `site-media` bucket, and add-on-dependent readiness checks before live validation.
13. Start the app with `npm run dev`, verify the public site loads from Supabase-backed content, submit a booking request, then sign in at `/admin`.

## Admin shell

- Public booking requests are written to `appointment_requests`.
- Notification log rows are queued automatically by database triggers when a request is submitted or when its status changes to accepted/rejected.
- The minimal admin shell is available at `/admin`.
- When Supabase auth is configured, admin login uses email/password through Supabase Auth.
- When Supabase auth is not configured in local development, the admin shell falls back to a local demo mode so the UI can still be exercised.
- The current content-management pass lets the business admin edit business profile data, services, FAQs, reviews, and the order of allowed managed sections.
- Pricing editing is now available only when the pricing add-on is active for that deployment and `pricingTiers` remains allowed in the admin experience config.
- Before/after gallery editing is now available only when the before/after add-on is active for that deployment and `beforeAfterItems` remains allowed in the admin experience config.
- Before/after gallery uploads use one `before` image and one `after` image per item in V1, stored in expandable media objects for later growth.
- Replacing or clearing unsaved gallery images now cleans up draft-only Supabase objects immediately, and saving the gallery removes previously saved assets that are no longer referenced.
- Team editing is now available only when the team add-on is active for that deployment and `teamMembers` remains allowed in the admin experience config.
- Case studies editing is now available only when the case-studies add-on is active for that deployment and `caseStudies` remains allowed in the admin experience config.
- Footer contact details and hours are derived from the business profile, and footer quick links are derived from the active managed sections.
- Package activation, locked section positions, and add-on enablement remain outside the client admin surface.
- When Supabase storage is not configured, local mode stores uploaded gallery images as data URLs so the editor and landing page can still be exercised without a client project.
- For abandoned uploads from interrupted sessions or failed saves, run `npm run site:sweep-media` against the client project with service-role env values to remove unreferenced gallery assets.
- Public-site styling is selected through `packageConfig.themePreset`. The base product currently ships with:
  - `bytefix-pro` for a modern tech-forward direction
  - `civic-ledger` for a more professional service-business direction

## Preflight behavior

- `site:preflight` is read-only. It does not create rows, buckets, or env values.
- It verifies:
  - browser Supabase env
  - service-role Supabase env
  - required core tables
  - seeded site-definition rows
  - `site-media` bucket readiness when the `beforeAfterGallery` add-on is enabled
  - provider-specific notification env readiness when the `notifications` add-on is enabled
  - the `process-appointment-notifications` Edge Function when the `notifications` add-on is enabled
- If the `notifications` add-on is enabled and `notification_provider` is `postmark`, preflight fails when `POSTMARK_SERVER_TOKEN` or `POSTMARK_FROM_EMAIL` is missing.
- If the `notifications` add-on is enabled and `notification_provider` is `smtp`, preflight fails when `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, or `SMTP_FROM_EMAIL` is missing.
- `POSTMARK_FROM_NAME` and `SMTP_FROM_NAME` remain optional and only produce warnings when their provider is enabled.

## Notifications add-on

- Automated email delivery is packaged as an add-on, not base behavior.
- Base deployments still create `notification_logs`, but the processor marks them `skipped` when the notifications add-on is not enabled.
- When the notifications add-on is enabled and the selected provider env values are configured, the app invokes the `process-appointment-notifications` Supabase Edge Function after:
  - a new appointment request is created
  - an appointment request is accepted or rejected
- The Edge Function sends:
  - admin/business email on new request
  - customer email on accept/reject
- The selected provider is controlled by `deployment_config.notification_provider`.
- Supported providers in the base product are:
  - `postmark` as the recommended default
  - `smtp` as a client-owned fallback option
- Each client deployment is expected to use client-owned provider credentials and cover the provider cost directly.

## Deployment

If this project remains linked to Lovable, publish from the Lovable UI. If deployment is moved elsewhere later, update this README with the production host and release flow.
