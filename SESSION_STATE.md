# Session State

## Current Objective
Keep the base product ready for repeated client instantiation while moving the first real deployment effort into `RushIT-PC`.

## Last Completed
Added a reusable `deployment:bootstrap` command to normalize copied deployment workspaces, then used it to rewrite the copied base-product docs and metadata in the `RushIT-PC` workspace.

## Next Actions
- Commit and push the deployment-bootstrap changes in the base product repo.
- Commit and push the normalized deployment-state files in `RushIT-PC`.
- Move active implementation into the `RushIT-PC` workspace.
- Replace the base seed content/preset with RushIT PC content and pricing.
- Connect the first real Supabase project for `RushIT-PC` and run apply/preflight/validation.

## Open Blockers/Risks
- `npm audit` still reports 11 vulnerabilities, but they are currently in dev/build/test tooling (`vite`, `rollup`, `esbuild`, `jsdom`, and related transitives) rather than the runtime app path.
- No live Supabase project is configured in this workspace yet, so the new SMTP path and theme presets are validated only through local tests/build and not through a real client deployment.
- `npm run lint` passes with 7 existing `react-refresh/only-export-components` warnings in shared shadcn UI files.
- `npm run build` warns that the main chunk is larger than 500 kB after minification.
- The notification add-on now depends on selecting a provider in deployment config and supplying the matching provider env vars in the target client project; `site:preflight` fails when the add-on is enabled but that setup is incomplete.
- The orphan-sweep script currently targets the before/after gallery prefixes only, which is correct for the current codebase but will need expansion if future media-backed modules use new storage paths.

## Notes
- Remote: `https://github.com/christianrodriguezcierpe-design/Dynamic-LndngPg-AdminDashboard-BookingSystem-CnfgLyr.git`
- Default branch: `main`
- `RushIT-PC` local workspace: `D:\Desktop\Bussiness\CODEX CLI Projects\RushIT-PC`
- `RushIT-Software` local workspace exists but remains deferred until after `RushIT-PC` validation.
