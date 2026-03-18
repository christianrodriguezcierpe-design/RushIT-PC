# RushIT-PC Provisioning Checklist

This checklist covers the external setup still required before RushIT-PC can move into live validation.

## 1. Create the Supabase Project

Create one dedicated Supabase project for RushIT-PC.

Recommended naming:
- project name: `rushit-pc`
- environment: production-style single deployment project

Record these values from Supabase Settings > API:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Notes:
- `SUPABASE_URL` can use the same project URL as `VITE_SUPABASE_URL`.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only and must never be exposed to the browser.

## 2. Decide the Notification Validation Path

RushIT-PC uses `smtp` as the deployment default notification provider.

For the notification-enabled validation pass, collect:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- optional `SMTP_FROM_NAME`
- optional `SMTP_SECURE`

If your hosting or business email provider already gives SMTP access, use those credentials for the validation pass.

## 3. Create the Local Env File

Copy `.env.example` to a local env file and fill the values you collected.

Required now for Supabase setup:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Required later only when notifications are enabled for validation:
- the SMTP values listed above

## 4. Apply Supabase Migrations

Apply these SQL files to the RushIT-PC Supabase project in order:

1. `supabase/migrations/20260311152000_site_foundation.sql`
2. `supabase/migrations/20260311170000_appointment_workflow.sql`
3. `supabase/migrations/20260311184500_business_admin_content_updates.sql`
4. `supabase/migrations/20260311193000_notification_delivery_addon.sql`
5. `supabase/migrations/20260313103000_site_media_storage.sql`
6. `supabase/migrations/20260313121500_notification_provider_smtp.sql`

## 5. Deploy the Notification Edge Function

Deploy the `process-appointment-notifications` Edge Function to the RushIT-PC Supabase project before the notification-enabled validation pass.

## 6. Seed the Deployment State

After env and migrations are ready, run:

```bash
npm run site:apply-preset
```

This should seed the RushIT-PC deployment profile into the project.

## 7. Run Preflight

Run:

```bash
npm run site:preflight
```

Expected progression:
- before env is configured: preflight fails on missing Supabase env
- after env but before migrations: preflight fails on missing tables/rows
- after migrations and preset apply: core checks should pass
- after notifications are enabled for validation: SMTP readiness and the notification function must also pass

## 8. Create the Business Admin User

In the target Supabase project:
- create the RushIT-PC business admin user in Supabase Auth
- use email/password login for the first validation pass

## 9. Run Live UAT

After preflight passes, execute the RushIT-PC UAT checklist in [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md).

RushIT-PC should not be considered a valid base-product proof until that UAT sheet passes without hidden manual fixes.