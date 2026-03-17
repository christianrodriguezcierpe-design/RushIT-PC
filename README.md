# RushIT PC

Deployment-specific workspace for `RushIT-PC`, derived from the reusable base product.

## Source of Truth

The canonical deployment process lives in the base product repo:
`https://github.com/christianrodriguezcierpe-design/Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr`

Use the base manual there for the reusable process. This repo keeps only the RushIT-PC deployment overlay, local assumptions, and validation sheet.

## Deployment Profile

- Deployment repo: `https://github.com/christianrodriguezcierpe-design/RushIT-PC.git`
- Base product repo: `https://github.com/christianrodriguezcierpe-design/Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr.git`
- Package tier: `base`
- Enabled add-ons: `pricing`
- Theme preset: `bytefix-pro`
- Notification provider default: `smtp`
- Active placeholder profile: notifications add-on disabled until the live validation pass explicitly enables it

## Current Status

RushIT-PC has been rebuilt cleanly from the latest published base-product `main`.

The repo now contains:
- deployment-specific placeholder business content for RushIT PC
- deployment-specific docs and metadata
- the `base + pricing` profile under `bytefix-pro`
- `smtp` as the deployment default notification provider

Still pending:
- dedicated Supabase project setup
- deployment env values
- Edge Function deployment
- preset apply, preflight, and live UAT

## Deployment Overlay Docs

- Local overlay and UAT: [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)
- Local deployment state: [SESSION_STATE.md](./SESSION_STATE.md)
- Local deployment decisions: [DECISIONS.md](./DECISIONS.md)
- Deployment metadata: [deployment.config.json](./deployment.config.json)

## Design Direction

- Theme preset: `bytefix-pro`
- Theme intent: modern and tech-forward, with strong contrast and clear service CTAs
- Business copy stance: practical and direct, without placeholder promises like emergency or same-day service until those are confirmed operationally

## Common Commands

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run site:apply-preset`
- `npm run site:preflight`
- `npm run site:sweep-media -- --dry-run`