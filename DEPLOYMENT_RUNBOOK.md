# RushIT-PC Deployment Overlay and UAT

This document is specific to the `RushIT-PC` deployment.

The canonical reusable deployment process lives in the base product manual:
`Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr/BASE_PRODUCT_DEPLOYMENT_MANUAL.md`

Use that upstream manual for the generic process. Use this document only for RushIT-PC-specific choices and validation.

## RushIT-PC Deployment Profile

- Business name: `RushIT PC`
- Package tier: `base`
- Enabled add-ons: `pricing`
- Theme preset: `bytefix-pro`
- Notification provider default: `smtp`
- Current active placeholder profile: notifications add-on disabled until the live validation pass enables it intentionally

## Provisioning Prerequisites

Before live validation, complete the external setup in [PROVISIONING_CHECKLIST.md](./PROVISIONING_CHECKLIST.md).

RushIT-PC cannot move into live validation until the deployment has:
- a dedicated Supabase project
- browser and service-role env values
- the notification Edge Function deployed
- SMTP credentials available for the notification-enabled validation pass

## RushIT-PC Content Assumptions

The current placeholder content is intentionally editable and conservative.

It assumes:
- practical PC repair and build messaging
- no emergency or same-day public promise in seed content
- pricing shown as planning ranges, not final quotes
- optional modules like gallery, team, case studies, lead magnet, and blog remain disabled for this deployment baseline

## RushIT-PC Execution Notes

When following the base deployment manual, apply these RushIT-PC-specific choices:

- use `deployment.config.json` in this repo as the local deployment identity
- keep the package profile at `base + pricing`
- keep the visual direction on `bytefix-pro`
- use `smtp` as the notification provider path when notifications are enabled for validation
- keep the current placeholder business content until it is replaced through admin after deployment setup

## RushIT-PC UAT Checklist

### Public Site
- Landing page loads RushIT-PC managed content, not generic base-product content.
- Active sections are limited to the intended `base + pricing` profile.
- Pricing renders correctly and can be disabled only through package/config changes, not public UI.
- Footer details are derived correctly from the RushIT-PC business profile.

### Admin and Content
- Admin login works against the dedicated RushIT-PC Supabase project.
- Business profile, services, pricing, FAQs, reviews, and section order can be edited without code changes.
- Disabled modules do not appear in admin navigation or public rendering.

### Request Workflow
- Public request submission creates a real appointment/service request.
- Admin can review requests, add notes, and accept or reject them.
- Request records and note history persist correctly.

### Notifications
- When the validation pass enables the notifications add-on, SMTP env configuration is present and passes preflight.
- New request and decision events create notification logs.
- SMTP delivery succeeds end to end for the enabled validation pass, or failures are logged clearly enough to fix upstream.

### Preflight and Ops
- `npm run site:apply-preset` succeeds against the dedicated RushIT-PC project.
- `npm run site:preflight` passes without hidden manual fixes.
- No unexpected manual data patching is required after deployment.

## Go / No-Go Standard

RushIT-PC validates the base product only if all of the following are true:

- RushIT-PC can be deployed from the base product through a documented repeatable process.
- It runs on its own Supabase project cleanly.
- Public site content is fully deployment-managed.
- Admin can operate the site without code edits.
- The request pipeline works end to end.
- Notifications work when enabled for validation.
- No hidden manual fixes are required after deployment.
- Issues found during validation are either fixed upstream in the base product or documented as known non-blockers.

If that standard is not met, RushIT-PC may still be usable, but the base product is not yet considered fully validated.