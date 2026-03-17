# Decisions Log

## 2026-03-17 - Bootstrap this deployment from the base product
- Context: This repository was created as a deployment-specific workspace derived from the reusable product at `https://github.com/christianrodriguezcierpe-design/Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr.git`.
- Decision: Keep this repository focused on RushIT PC deployment customization and validation. Reusable product architecture changes should still be made upstream in the base product first.
- Consequences: README, session state, and future decisions in this repo are deployment-specific. Base-product decisions remain documented in the upstream product repository.

## 2026-03-17 - RushIT-PC deployment baseline
- Context: RushIT-PC is the first real deployment used to validate the base product end to end.
- Decision: Rebuild this repo cleanly from the latest published base-product `main` instead of syncing the older deployment state forward.
- Consequences: This repo should only differ from the base product where RushIT-PC owns the deployment layer: deployment metadata, placeholder business content, local overlay docs, and UAT state.

## 2026-03-17 - Initial deployment profile
- Context: This deployment needs a clean starting configuration before business-specific infrastructure is added.
- Decision: Start RushIT PC with package tier `base`, add-ons `pricing`, theme preset `bytefix-pro`, and notification provider default `smtp`.
- Consequences: Future changes to package shape, theme, or provider should be recorded here as deployment-specific decisions.

## 2026-03-17 - Keep reusable process upstream
- Context: Earlier deployment docs mixed reusable-product process with deployment-local notes, which made the deployment repo look like the source of truth.
- Decision: Keep the canonical deployment process only in the base-product manual. Keep RushIT-PC documentation limited to local assumptions, execution notes, and validation criteria.
- Consequences: Updates to the reusable deployment process must land upstream first. RushIT-PC only records how that process applies to this specific deployment.

## 2026-03-17 - Placeholder profile stays conservative
- Context: The public placeholder content in a first deployment can accidentally imply real operational promises before the business confirms them.
- Decision: Keep the RushIT-PC placeholder copy practical and editable, without emergency or same-day promises in seed content.
- Consequences: The public seed is safer for first validation, and any stronger service claims must be added intentionally later through managed content.