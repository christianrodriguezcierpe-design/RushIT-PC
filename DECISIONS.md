# Decisions Log

## 2026-03-11 - Use direct branch pushes against origin
- Context: The repository was cloned locally to support development before changes are pushed back to GitHub.
- Decision: Keep `origin` pointed at the provided GitHub repository and create local working branches directly from `main` instead of using a fork.
- Consequences: Local work stays simple, first push for a branch should use `git push -u origin <branch-name>`, and this workflow assumes the developer has push access to the upstream repository.

## 2026-03-11 - Use per-client Supabase projects with external package activation
- Context: The product is intended to be deployed separately for each business rather than as a shared SaaS platform, and add-ons must not be self-activated by business admins.
- Decision: Use one Supabase project per client deployment, keep package/add-on activation outside the normal app admin as repo-stored presets plus privileged apply scripts, and expose only business content plus constrained ordering controls inside the client-facing admin.
- Consequences: Each client instance stays hard-isolated, business admins cannot self-upgrade by manually calling APIs, and the app must distinguish fixed preset-controlled sections from reorderable managed sections.

## 2026-03-11 - Store the landing definition in typed JSONB-backed section tables
- Context: The product needs a real table-backed content source now, but a fully normalized content schema would slow V1 and add unnecessary admin complexity before the workflow/admin features exist.
- Decision: Store business profile, deployment config, fixed section content, and managed section content in a small set of typed tables, with per-section content persisted as JSONB payloads keyed by known section types.
- Consequences: The frontend can load a real site definition from Supabase immediately, preset application stays straightforward, and future admin forms can remain typed per section without turning the product into a generic page builder.

## 2026-03-11 - Use email/password admin auth and trigger-backed notification logging for V1
- Context: V1 needs a simple business-admin login and a real appointment request workflow, but not a full notification delivery service yet.
- Decision: Use Supabase Auth email/password for the business admin, expose a minimal `/admin` shell, persist appointment requests/notes in dedicated workflow tables, and queue notification log rows through database triggers when requests are submitted or reviewed.
- Consequences: The workflow becomes operational without exposing internal package controls, public request submission remains simple, and a later notification sender can process queued log rows without redesigning the request model.

## 2026-03-11 - First admin content pass stays scoped to core business-managed content
- Context: The business admin needs real editing capability now, but exposing all sections and configuration rules immediately would blur the boundary between business content and product assembly.
- Decision: The first admin content pass covers business profile data, services, FAQs, reviews, and reorderable managed section order, while leaving pricing, footer-specific editing, package controls, and add-on activation out of scope.
- Consequences: The admin surface stays aligned with the core business-content boundary, local mode remains simple to validate, and future content modules can be added incrementally without reopening internal configuration decisions.

## 2026-03-11 - Package automated email delivery as a Postmark-backed add-on
- Context: Appointment workflow notifications require a recurring third-party provider cost, and that cost should be passed directly to clients who want automated email.
- Decision: Keep notification logs in the base workflow, but treat outbound email delivery as a `notifications` add-on backed by client-owned Postmark credentials stored in deployment env vars. The browser triggers a Supabase Edge Function after request creation and review actions so queued logs are marked `sent`, `failed`, or `skipped`.
- Consequences: Base deployments keep a usable manual workflow, clients only pay for email delivery if they buy the add-on, provider secrets stay out of the client admin and database, and notification processing depends on deploying the Supabase Edge Function plus Postmark env vars.

## 2026-03-11 - Expose pricing content only when the package actually includes it
- Context: Pricing is a business-managed content area, but it is also an optional paid module and should not leak into the client admin or ordering controls when the add-on is not active.
- Decision: Add a dedicated pricing editor in `/admin`, but render it only when the deployment both allows the `pricing` section and includes the `pricing` add-on. Filter the section-order editor through the allowed managed-section list so optional modules stay hidden when excluded from the package.
- Consequences: Pricing becomes editable for eligible deployments without weakening the package boundary, and admin presentation controls better reflect the active commercial configuration.

## 2026-03-11 - Keep the V1 footer fully derived instead of editable
- Context: Footer content mostly duplicates existing business profile fields and section structure, so a separate footer editor would add noise to the admin without providing much real flexibility.
- Decision: For V1, derive the footer automatically from business profile data and active section links. Do not add a dedicated footer-management UI. Any later footer-only customization should be treated as a small optional module rather than part of the core admin surface.
- Consequences: Business admins update one source of truth for contact info and hours, footer links stay aligned with active sections, and V1 avoids another low-value content editor.

## 2026-03-12 - Extend optional admin modules incrementally using the same package-gated content pattern
- Context: Optional modules like team should be sellable repeatedly without expanding the admin into an unrestricted CMS.
- Decision: Add team management as the next optional admin module, but expose it only when the deployment both allows the `team` section and includes the `team` add-on, using the existing managed-section content mutation flow rather than introducing a separate subsystem.
- Consequences: Optional modules can be added one at a time with predictable behavior, admin visibility stays aligned with package rules, and future modules like case studies or galleries should follow the same pattern.

## 2026-03-12 - Use the same package-gated pattern for case studies
- Context: Case studies are another optional trust-building module that should be reusable across deployments without weakening the admin boundary.
- Decision: Add case-studies management through the same managed-section editor approach, and expose it only when the deployment includes both the `caseStudies` section and add-on while keeping admin visibility tied to the `caseStudies` collection permission.
- Consequences: The optional-module pattern is now validated across pricing, team, and case studies, making the next modules more mechanical to add and less likely to drift from package rules.

## 2026-03-13 - Model before/after gallery media as single-image slots with expandable image objects
- Context: The before/after gallery is the first optional module that genuinely needs media handling, but V1 still needs to stay simple and avoid overbuilding a generalized asset system.
- Decision: Represent each gallery item with one `beforeImage` and one `afterImage` object containing `url`, `path`, and `alt`, expose the editor only when the `beforeAfterGallery` add-on and `beforeAfterItems` collection are allowed, and use a public Supabase `site-media` bucket with authenticated uploads. In local mode, uploads fall back to data URLs so the feature still works without a live client project.
- Consequences: V1 gets real image-backed gallery management without locking the model into flat strings, existing legacy text-only gallery content can be normalized forward, and the media shape can grow later to support multiple images or richer media metadata without replacing the whole section model.

## 2026-03-13 - Combine immediate gallery cleanup with a manual orphan sweep command
- Context: Media uploads now create real storage objects, so replacing, clearing, or abandoning gallery images can leave unreferenced files in the bucket if cleanup only happens at the content layer.
- Decision: Clean up draft-only gallery assets immediately inside the editor when they are replaced or cleared, delete previously saved gallery assets only after a successful content save diff confirms they are no longer referenced, and add a service-role `site:sweep-media` command to remove older orphaned gallery objects from the `site-media` bucket.
- Consequences: Normal editing keeps storage tidy without breaking the currently published site, interrupted sessions can still be repaired through a lightweight ops command, and V1 avoids background-job complexity while closing the main orphaned-media risk.

## 2026-03-13 - Fix only production-facing dependency audit issues before live client validation
- Context: The first real client validation should not be blocked by broad dependency churn, but the repo still had reported audit findings and some of them were in runtime dependencies.
- Decision: Before the live client validation, patch only the production-facing dependency findings: upgrade `react-router-dom` to `6.30.3` and force `lodash` to `4.17.23` through `package.json` overrides because it is pulled into the runtime bundle by `recharts`. Defer the remaining audit findings because they are in dev/build/test tooling (`vite`, `rollup`, `esbuild`, `jsdom`, and related transitives).
- Consequences: The app’s main runtime audit blockers are cleared with low-risk changes, the dependency pass stays aligned with the “release blockers only” rule, and the next pre-validation step can focus on deployment preflight rather than broader toolchain cleanup.

## 2026-03-13 - Add a strict read-only deployment preflight before real client validation
- Context: The remaining release risk is no longer runtime package exposure; it is environment and deployment drift across Supabase, storage, seeded rows, and notification setup.
- Decision: Add a read-only `site:preflight` script that validates browser env, service-role env, required tables, seeded site rows, storage-bucket readiness for the `beforeAfterGallery` add-on, Postmark env readiness for the `notifications` add-on, and the notification Edge Function when notifications are enabled. If notifications are enabled but required Postmark env is missing, preflight fails instead of warning.
- Consequences: The first real client validation can fail fast on setup drift before any manual QA starts, deployments with sold-but-broken notifications are blocked early, and add-on-dependent infra checks stay aligned with package configuration instead of being enforced globally.

## 2026-03-13 - Make notifications provider-aware with SMTP as the base-product fallback option
- Context: The notifications add-on should stay reusable across deployments, but some clients may want to use their own SMTP-capable hosting/email service instead of Postmark.
- Decision: Keep `postmark` as the recommended default notification provider, add `smtp` as a supported fallback provider in the base product, and select the active provider through `deployment_config.notification_provider` while keeping provider secrets in env vars only.
- Consequences: Notification delivery stays deterministic per deployment, preflight can validate provider-specific readiness, client-owned SMTP can back the same add-on contract, and provider choice is handled in the base product rather than as a RushIT-only customization.

## 2026-03-13 - Add a controlled theme-preset layer for deployment-specific visual direction
- Context: Different client deployments need visibly different public-site styling, but free-form design controls would blur the product boundary and create support overhead.
- Decision: Keep visual choice in deployment config through `packageConfig.themePreset`, and map that preset to controlled CSS-variable theme definitions for colors, typography, gradients, radius, and overall tone instead of exposing runtime styling controls.
- Consequences: New deployments can choose a visual direction like tech-forward or professional without code surgery, the base product remains reusable, and client-facing admin stays focused on business content rather than product styling internals.
