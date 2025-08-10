## Configurable Admin Demo (App Store) – Implementation Guide

### Build Checklist (Multi-tenant v0.1)
- [ ] Auth + session mapping
  - [ ] Integrate Auth provider (Clerk or Auth.js)
  - [ ] Map session → Convex `users` row
  - [ ] Add `TenantProvider` exposing `userId`, `orgId`, `role`
  - [ ] Configure local dev environment for auth (env vars, webhooks if needed)
  - [ ] Create test users in the auth provider (e.g., Clerk) and document credentials
- [ ] Orgs & memberships
  - [ ] Create Convex `organizations`, `memberships` tables
  - [ ] Backfill default `demo-org`; link existing demo data
  - [ ] Add `orgId` + indexes to key tables (workflows, items, locations, messages, tasks, notifications, activityLog, settings, POs, brands, factories)
- [ ] Server enforcement
  - [ ] Add `withOrg` guard to resolve and enforce `orgId`
  - [ ] Scope all live queries/mutations by `orgId`
  - [ ] Add `organizationSettings.enabledFeatures` and enforce feature flags server-side
  - [ ] Add basic rate-limiting and activity logging for sensitive mutations
- [ ] Live adapters + `/app` shell
  - [ ] Implement `liveDataAdapter` (tenant-scoped) parallel to `demoDataAdapter`
  - [ ] Scaffold `/app` route with header + sidebar + configurable main area
  - [ ] Render dashboard from tenant state; gate widgets by `enabledFeatures`
- [ ] Onboarding (live)
  - [ ] `/app/onboarding` wizard to collect answers
  - [ ] `applyRecipe()` creates tenant dashboards, widgets, workflows
  - [ ] Redirect to `/app` with the generated layout

### Auth & Tenant Isolation Testing (Post‑Auth Blocker)
- Test setup
  - Configure Clerk (or chosen provider) for local dev; add env vars to `.env.local`.
  - Create 3 users: `ownerA@example.com`, `memberA@example.com` (Org A), `ownerB@example.com` (Org B).
  - Create 2 orgs: Org A, Org B. Add memberships with roles: `owner`, `member`.
  - Seed minimal data if needed (none required for isolation tests).

- Manual verification flow (must pass before proceeding)
  1) Sign in as `ownerA`. Visit `/app/onboarding`, complete wizard → verify a dashboard is created for Org A and appears at `/app`.
  2) Sign out; sign in as `ownerB`. Verify Org B sees no data from Org A; onboarding creates a separate dashboard for Org B.
  3) Sign in as `memberA`. Verify reads permitted for Org A, writes limited by role (if enforced at this stage).
  4) Attempt to access a known ID from the other org (paste URL or call API): ensure server denies access.

- Automated checks
  - E2E (Playwright or Cypress):
    - Login as each user; run onboarding; assert `orgId` on created records; assert absence across orgs.
    - Access negative tests: attempt cross‑org reads/writes → expect 403/denied.
  - Server tests (Convex function tests or integration harness):
    - Call mutations/queries with mocked identity for Org A against Org B records → expect rejection.
    - Ensure every live function uses `withOrg` and filters by `orgId`.

- Security measures (MVP)
  - Require auth for all `/app` routes; block SSR data without valid session.
  - Enforce `orgId` on server from session only; ignore/verify any client‑provided `orgId`.
  - Rate limit sensitive mutations (e.g., onboarding apply, dashboard writes) and log in `activityLog` with `orgId` and `userId`.
  - Minimal PII handling; avoid logging secrets or tokens.

- Acceptance criteria (blockers to merging feature work)
  - Distinct users in distinct orgs cannot see or mutate each other’s data.
  - Onboarding generates separate dashboards per tenant.
  - All live Convex functions accessed by `/app` are guarded by `withOrg` and validate membership.
  - E2E suite passes locally (CI optional initially, recommended soon after).

### Goals
- Showcase a standalone, configurable admin dashboard demo with an “App Store” concept.
- Start with a blank core dashboard and include the workflow builder by default.
- Allow users to add/configure plug-and-play widgets from a mini “App Store.”
- Keep this demo fully isolated so existing Admin, Floor, and Brand areas are unaffected.
- Support an optional guided onboarding that can “write the app” for users by programmatically generating the dashboard layout, widget configs, and demo workflows based on answers.

### Non‑Goals
- No persistent server-side mutations or schema changes.
- No changes to existing Admin/Floor/Brand flows or their routes.
- No refactoring of production components unless duplicating is riskier than extracting.

### High-Level Approach
- Create a new isolated route tree under `app/demo/` for all demo pages and assets.
- Use a local, in-memory + localStorage state model for demo configuration and layout.
- Prefer copies/wrappers of existing widgets/components over refactors to avoid regressions.
- Provide a small plugin API and registry to register demo widgets.
- Use mock/demo data via a `lib/demoDataAdapter.ts` to avoid coupling to live Convex data.
- Define a programmatic build API (“DemoState API”) that onboarding uses to compose the app from a recipe.

### Routing & Navigation
- New route: `app/demo/page.tsx` (entry point)
  - Contains the admin-style shell (header + sidebar) with a configurable main area featuring the blank dashboard canvas, the workflow builder, and an “Open App Store” button.
- Homepage: replace the existing “Item Tracking” card to link to `/demo` and update its copy to explain the configurable admin demo. No other homepage cards are changed.
- Add `app/demo/onboarding/page.tsx` for the guided onboarding flow; also expose an entry point from `/demo` header (“Guided Onboarding”).

### Data Strategy (Isolation-first)
- Create `lib/demoDataAdapter.ts` with static/demo data and simple async facades (promise-based) simulating reads.
- Do not import mutations from Convex within demo.
- If a widget needs real reads, import only read-only queries through an adapter layer to keep a single swap point.

### State & Persistence
- Dashboard layout stored in `localStorage` under a namespaced key: `groovy-demo.demo.dashboardLayout.v1`.
- Widget configuration per instance stored alongside layout.
- Provide a reset action to clear demo state.
- Add import/export JSON of the entire demo state (`groovy-demo.demo.export.v1`) to enable sharing and future migrations.

### Plugin API (Widget Contract)
```ts
// components/demo/types.ts
export type DemoWidgetConfig = Record<string, unknown>

export interface DemoWidgetProps<C extends DemoWidgetConfig = DemoWidgetConfig> {
  config: C
  dataSource: DemoDataSource
  onEvent?: (event: { type: string; payload?: unknown }) => void
}

export interface DemoWidget<C extends DemoWidgetConfig = DemoWidgetConfig> {
  id: string
  title: string
  icon?: React.ReactNode
  tags?: string[]
  description?: string
  defaultConfig: C
  Component: React.FC<DemoWidgetProps<C>>
  // Optional schema metadata for a generic config form
  configSchema?: Array<{ key: keyof C; label: string; type: 'string' | 'number' | 'boolean' | 'select'; options?: string[] }>
  // Optional programmatic helpers for onboarding
  generateConfig?: (answers: Record<string, unknown>) => Partial<C>
  validateConfig?: (config: Partial<C>) => { valid: boolean; errors?: string[] }
}

export type DashboardLayout = Array<{
  instanceId: string
  widgetId: string
  position: number
  size?: 'sm' | 'md' | 'lg' | 'full'
  config: DemoWidgetConfig
}>
```

### Programmatic Build API (DemoState API)
- `lib/demoState.ts` exports a strongly-typed API that both the UI and onboarding can use:
```ts
export interface DemoStateAPI {
  getLayout(): DashboardLayout
  setLayout(layout: DashboardLayout): void
  addWidget(widgetId: string, config?: DemoWidgetConfig, options?: { position?: number; size?: 'sm' | 'md' | 'lg' | 'full' }): string // returns instanceId
  updateWidget(instanceId: string, updates: { config?: DemoWidgetConfig; size?: 'sm' | 'md' | 'lg' | 'full'; position?: number }): void
  removeWidget(instanceId: string): void
  reset(): void
  export(): string // JSON
  import(json: string): void
  applyRecipe(recipe: OnboardingRecipe): void
}
```

### Onboarding Experience
- Two modes at `/demo`:
  - Explore: blank canvas + App Store, fully manual.
  - Guided Onboarding: launches an interactive flow at `/demo/onboarding` that asks questions and then generates the app.
- Flow steps (MVP):
  1) Select industry/use case (e.g., Apparel, Logistics, Assembly)
  2) Choose core capabilities (Messaging, Item Tracking, Capacity, Calendar, Live Feed, Approvals)
  3) Configure key preferences (naming, units, simple SLAs)
  4) Pick or adjust a workflow template
  5) Review & generate app → applies a recipe and navigates to `/demo`
- Implement as `components/demo/onboarding/*` (wizard shell + step components), writing only to DemoState API.

### Onboarding Recipe Schema
```ts
// lib/onboarding/types.ts
export interface OnboardingRecipe {
  name: string
  description?: string
  tags?: string[]
  theme?: { accentColor?: string; logoUrl?: string }
  widgets: Array<{
    widgetId: string
    size?: 'sm' | 'md' | 'lg' | 'full'
    position?: number
    config?: DemoWidgetConfig
  }>
  workflow?: {
    name: string
    description?: string
    stages: Array<{ name: string; color?: string; description?: string; actions?: unknown[] }>
  }
}
```
- The onboarding flow builds an `OnboardingRecipe` from answers and calls `DemoStateAPI.applyRecipe()`.
- Widgets with `generateConfig` can enrich the recipe using the collected answers.

### Templates & Starter Packs
- Add a small library of starter recipes in `lib/onboarding/recipes/*` (e.g., Basic Production, Express, Quality-first).
- Expose “Load Starter” in onboarding and on the `/demo` toolbar.


### Widget Registry
- Create `components/demo/registry.tsx` exporting `demoWidgetRegistry: Record<string, DemoWidget>`.
- Initial entries:
  - `workflow-builder` (embed existing workflow builder)
  - `metrics` (simple KPIs with mock data)
  - `live-feed` (static/sample activity feed)
  - `calendar` (read-only sample calendar)
  - `capacity` (simulated capacity chart)
- Where existing admin widgets are mature (e.g., `components/admin/modular-dashboard.tsx`), prefer lightweight wrappers or forked copies to avoid cross-impact.

### App Store UI
- `components/demo/AppStoreModal.tsx`
  - Lists registry entries with search/filter by tag.
  - Shows a short description and preview (optional lightweight preview component or static image/illustration).
  - “Install” adds a new instance to the layout with `defaultConfig`.

### Dashboard Canvas
- `components/demo/DemoDashboard.tsx`
  - Renders instances via registry lookup: `registry[widgetId].Component`.
  - Supports editing mode: move, resize, remove, configure.
  - DnD via `@dnd-kit` (aligning with existing patterns) or `hello-pangea/dnd` if simpler.
  - “Configure” opens a generic config panel driven by `configSchema`.
  - Persist layout updates to localStorage on change.

### Layout & Shell (Admin-style)
- Use `AppHeader` for the top header to match the app.
- Create `components/demo/demo-sidebar.tsx` (fork styles from `components/layout/admin-sidebar.tsx` and/or `components/ui/sidebar.tsx`) to ensure a similar look and feel without coupling to admin logic.
- `app/demo/page.tsx` composes `AppHeader` + `DemoSidebar` + a configurable main content area.
- Keep the layout responsive and match spacing/typography used in admin pages.

### Workflow Builder Integration
- Reuse one of the existing builders inside a demo wrapper:
  - Preferred: `components/workflow/workflow-builder.tsx` (simpler) or `components/workflow/simple-workflow-builder.tsx`.
  - Use a wrapper to disable any real persistence; `onSave` simply toasts and updates a local preview in the dashboard.

### Visual Composition
- Starter layout when visiting `/demo`:
  - Admin-like shell: top `AppHeader` + left `DemoSidebar` + main content area.
  - Main content: blank dashboard canvas with “Open App Store”.
  - Include Workflow Builder as a default widget or accessible via a collapsible panel within the main area.
  - Provide “Reset Demo” and “Load Sample Layout” actions in the main toolbar.

### Guardrails to Avoid Cross-Impact
- All new code lives under `app/demo/`, `components/demo/`, and `lib/demoDataAdapter.ts`.
- No imports from `components/admin/*` that could cause shared state or side effects. If reusing visuals, copy minimal presentational code only.
- Modify only the homepage’s “Item Tracking” card to link to `/demo`; do not change other pages/routes.
- No writes to Convex; keep the demo stateless on the server.

### Testing & Safety
- Build-time: Ensure no TypeScript errors across new files.
- Runtime: The demo should work with zero backend setup (purely mock data).
- Lints: Keep ESLint/TS happy; avoid touching existing files beyond adding one homepage link.

### Rollout Steps
1) Scaffolding
   - `app/demo/page.tsx` entry
   - `components/demo/*` (Dashboard, AppStoreModal, Widget chrome, types, registry)
   - `lib/demoDataAdapter.ts`
2) Widgets (MVP)
   - Workflow Builder wrapper (`workflow-builder`)
   - Metrics, Calendar, Capacity, Live Feed (mock-backed)
3) DnD + Persistence
   - Implement move/reorder, size, add/remove; persist layout
4) App Store UX polish
   - Search, tags, previews
5) Homepage integration
   - Replace the “Item Tracking” card link/label to point to `/demo` and update copy to reflect the configurable admin demo

### Work Breakdown
- 0.5d: Scaffolding route + context/state + registry
- 1.0d: App Store + generic config form
- 1.0d: Dashboard canvas with DnD + persistence
- 1.0d: Initial widgets (4-5) using demo adapter
- 0.5d: Workflow builder integration wrapper
- 0.5d: Homepage CTA + styling pass

### Risks & Mitigations
- Refactor bleed into admin components → Mitigation: copy/wrap into `components/demo/`.
- Unexpected Convex coupling → Mitigation: demo adapter first; add optional read adapters later.
- UX scope creep → Mitigation: lock MVP widgets + simple config; iterate after demo is live.

### Success Criteria
- `/demo` renders without any data seeding.
- Users can add/remove/reorder widgets and persist layout locally.
- Workflow builder can be used in demo without saving to server.
- No regressions in Admin/Floor/Brand routes or components.



## Live v0.1 Customer App Track (Multi‑tenant Ready)

### Objective
- Use the demo foundation as the basis for a real, invite-ready v0.1 app while keeping current `Admin/Floor/Brand` as an internal playground. Minimal, safe changes to introduce multi-tenancy and auth.

### Separation of Concerns
- Keep existing sections as playground/dev:
  - `app/admin`, `app/floor`, `app/brand` remain unchanged.
- New customer-facing area:
  - `app/app/` (or `app/live/`) – authenticated, tenant-aware shell with the same header + sidebar pattern.
  - For MVP, `/app` uses the same widget model as `/demo` but persists to the database for the tenant instead of localStorage.

### Authentication (Pluggable)
- Use a provider with good Next.js + Convex interop (choose one):
  - Clerk or Auth.js (NextAuth). Either can map to a Convex `users` row.
- Session → Convex identity:
  - On server functions, read the user identity and resolve tenant memberships.
  - On client, provide a `useSession()` wrapper that exposes `userId` and `orgId`.

### Multi‑Tenant Model
- Add tables:
  - `organizations` (aka tenants): `{ name, slug, createdAt, ownerUserId, metadata }`.
  - `memberships`: `{ userId, orgId, role }` with roles: `owner`, `admin`, `member`, `viewer`.
- Add `orgId` to domain tables and indexes (MVP: workflows, items, locations, messages, tasks, notifications, activityLog, settings).
- Server enforcement:
  - All queries/mutations must require an `orgId` derived from session; never accept arbitrary `orgId` from the client without verifying membership.
  - Filter every read/write by `orgId`.

### Data Persistence Modes
- Demo mode (`/demo`): LocalStorage only (no writes to Convex).
- Live mode (`/app`): Persist via Convex using the same structures, but always tenant-scoped.
- Shared component interfaces so widgets work in both modes (data adapters: demo vs live).

### Onboarding → “Write the App”
- Reuse the recipe model:
  - In live mode, `applyRecipe()` calls Convex mutations to create tenant-scoped workflows, widgets/layout, and default settings.
  - In demo mode, `applyRecipe()` writes to DemoState only.
- After onboarding completion:
  - Navigate to `/app` with the generated layout live for that org.

### Routing
- Public landing + sign-in/up → `/`.
- Demo (no auth) → `/demo`.
- Live authenticated app → `/app`.
- Onboarding wizard:
  - Demo path: `/demo/onboarding`.
  - Live path: `/app/onboarding` (requires auth; writes to tenant).

### Minimal Schema Additions (Convex)
- New tables:
  - `organizations`, `memberships`.
- Add `orgId` (indexed) to:
  - `workflows`, `items`, `completedItems`, `itemHistory`, `completedItemHistory`, `scans`, `notifications`, `messages`, `tasks`, `activityLog`, `locations`, `settings`, `purchaseOrders`, `brands`, `factories`.
- Migration plan:
  - Create a default org `demo-org`.
  - Backfill existing demo rows with `orgId = demo-org`.
  - Add server-side guards to reject queries without tenant context in live endpoints.

### Backend Changes (Scoped, Minimal)
- Create a `withOrg` server wrapper to resolve `orgId` from session and apply access checks.
- Introduce `liveDataAdapter` mirroring `demoDataAdapter` APIs, but calling Convex functions that include `orgId`.
- Gradually port widgets to call the adapter layer, not Convex directly.

### Frontend Changes
- New `TenantProvider` context that exposes `orgId` and membership role.
- `app/app/page.tsx` using the admin-style shell and the same dashboard canvas, but bound to live adapter.
- Feature flag to hide playground routes in production navigation while keeping them in dev.

### Delivery Phases
1) Auth + Org scaffolding:
   - Auth provider, `organizations` + `memberships`, `TenantProvider`, `withOrg` server guard.
2) Live `/app` shell + adapters:
   - Implement `liveDataAdapter`, switch a small set of widgets to use adapter.
3) Onboarding (live):
   - `/app/onboarding` writes a minimal recipe (workflow + 2-3 widgets) for the tenant.
4) Hardening:
   - RBAC checks, rate limits, basic audit logs in `activityLog` scoped by `orgId`.

### Refactor vs Fresh Environment
- Recommendation: stay in this repo.
  - Add tenant fields and adapters incrementally; keep playground routes intact.
  - Benefits: faster iteration, shared UI components, no duplication.
- Fresh repo only if:
  - You want a different tech stack for auth or data.
  - You need a separate deployment cadence/compliance boundary.

### Work Needed (at a glance)
- Auth integration and session mapping → Convex user + memberships.
- New org/membership tables and indexes; add `orgId` columns and backfill.
- Server guards (`withOrg`) and adapter pattern (demo vs live).
- `/app` route and tenant-aware shell + dashboard.
- Onboarding writing live data for an org.

### Tenant App Config & Persistence
- Persistence model (v0.1 simple, evolvable):
  - `organizationSettings` table: `{ orgId, enabledFeatures: string[], theme, navConfig, defaultDashboardId, updatedAt }`.
  - `dashboards` table: `{ id, orgId, name, scope: 'org' | 'role' | 'user', ownerId?: string, role?: string }`.
  - `dashboardWidgets` table: `{ id, dashboardId, widgetId, position, size, config, createdAt, updatedAt }`.
  - Alternative (faster MVP): a single JSON blob per dashboard with widget instances; migrate to normalized tables later.
- Load flow:
  - On `/app` load, fetch `organizationSettings` + user membership → pick dashboard (org default + role/user overlay).
  - Fetch dashboard layout → render registry-backed widgets.
- Save flow:
  - UI edits write to `dashboardWidgets` (or JSON blob) via tenant-scoped mutations.
  - Onboarding `applyRecipe()` creates a dashboard + widget instances + updates `organizationSettings.enabledFeatures`.

### Feature Enablement & Access Control
- Feature flags (per org): maintain `enabledFeatures: string[]` in `organizationSettings`.
- Widget registry entries declare `featureKey` and won’t render or be installable if the feature is disabled.
- Navigation and routes derive visibility from `enabledFeatures` and role.
- Server-side enforcement: mutations/queries for gated capabilities check both membership and `enabledFeatures`.

### Configuration Scope & Overrides
- Scopes:
  - Org-level: default dashboard for everyone in the tenant.
  - Role-level: add or override widgets for `admin`/`operator`/etc.
  - User-level: personal tweaks (reorder/hide); stored in a `userDashboards` overlay.
- Resolution order: user → role → org (first match wins), merged at render.

### Draft/Publish & Versioning (Optional v0.2)
- Draft vs Published dashboards to prevent mid-edit disruption.
- Version field on dashboards to enable migrations and rollback.
- Audit via `activityLog` with `orgId` for changes to app configuration.
