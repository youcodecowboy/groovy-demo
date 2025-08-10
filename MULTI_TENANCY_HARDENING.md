## Multi‑Tenancy Hardening Plan

Goal: Every authenticated user lands on a working, isolated tenant with a persisted organization name and default dashboard. The flow is idempotent, resilient to partial failures, and consistent across devices.

### 1) Desired invariants
- On sign‑in/up, the user always has:
  - one active organization (name + slug),
  - an owner membership,
  - a default dashboard and org settings.
- `ensureOrgForCurrentUser()` is idempotent and safe to call any time.
- Reads never crash the UI; if server side fails, the client shows an inline recovery CTA.

### 2) Server API design
- Create a single mutation: `tenancy.ensureOrgForCurrentUser()` → `{ orgId, name, slug }`
  - Looks up membership by `userId`.
  - If missing, creates: `organizations`, `memberships`, `dashboards`, `organizationSettings`.
  - If present, returns existing org.
  - Always succeeds for authenticated users; never throws except unauthenticated.
- Create a query: `tenancy.getOrgProfile()` → `{ name, slug } | null`
  - Reads via resolved membership; returns `null` if somehow missing.
  - Never throws.

Implementation notes:
- Keep slug unique. If collision, suffix with `-<rand4>`.
- All writes in one mutation (atomic under Convex guarantees).
- Add indices already present: `memberships.by_user`, `organizationSettings.by_org`, `dashboards.by_org`.

### 3) Bootstrap flow (client)
- After sign‑in redirect to `/app`, run once:
  - Call `ensureOrgForCurrentUser()` in a `useEffect`.
  - Store result in a lightweight `OrgContext` (`name`, `slug`).
- Replace reactive `useQuery(getOrganization)` on the landing page with:
  - Read from `OrgContext` first,
  - Then one‑shot fetch `getOrgProfile()`; update context if received.
- On rename, call `updateOrganizationName(name)`; update context immediately.

### 4) UI/UX patterns
- If context has no name yet, show company name input with Save.
- Once saved, swap to actions (“Guided tour”, “Start onboarding”).
- Never block render on org queries; degrade gracefully with context fallback.

### 5) Error handling
- Mutations:
  - `ensureOrgForCurrentUser`: throw only when unauthenticated; otherwise self‑heal.
  - `updateOrganizationName`: if membership missing, internally call the same creation logic as `ensureOrgForCurrentUser` before patching.
- Queries: return `null` on failure; clients must handle `null` by showing the create/repair CTA.

### 6) Auth & routing
- Clerk provider:
  - `afterSignInUrl=/app`, `afterSignUpUrl=/app`, `afterSignOutUrl=/`.
- Middleware:
  - Keep `/`, `/sign-in`, `/sign-up` public. All others guarded.

### 7) Data model sanity checks
- Tables present: `organizations`, `memberships`, `dashboards`, `organizationSettings`.
- Required indices:
  - `memberships.by_user(userId)`
  - `organizationSettings.by_org(orgId)`
  - `dashboards.by_org(orgId)`

### 8) Backfill/migration
- Action: `tenancy.backfillOrgsForUsers()`
  - For users lacking membership, create org + membership + default dashboard + settings.
  - Dry‑run mode prints counts; then run with `apply=true`.

### 9) Testing checklist
- Fresh user: sign‑up → redirected to `/app` → `ensureOrg…` creates org → page shows “<Company> OS”.
- Existing user without org: sign‑in → `ensureOrg…` creates org → success.
- Rename: persists on server, context updates, re‑open on new device shows new name.
- Sign‑out → `/` (home). Sign‑in again → org present.
- Concurrent calls: multiple tabs call `ensureOrg…` → still exactly one org/membership.

### 10) Rollout steps
1. Implement `ensureOrgForCurrentUser` mutation and `getOrgProfile` query.
2. Replace landing page org reads with Context + one‑shot profile fetch.
3. Move rename to use Context update + server mutation.
4. Add `/debug` org panel (read + rename) for ops.
5. Deploy and verify with a fresh user.

### 11) Instrumentation
- Log counts when auto‑provisioning runs.
- Add Convex function timings (dev logs) to watch for hotspots.

### Appendix – minimal client snippet (pattern)
```ts
// useOrg.ts
export function useOrg() {
  const [org, setOrg] = useState<{name:string; slug:string} | null>(null)
  const ensureOrg = useMutation(api.tenancy.ensureOrgForCurrentUser)
  const getProfile = useQuery(api.tenancy.getOrgProfile)
  useEffect(() => { void ensureOrg().then(setOrg) }, [])
  useEffect(() => { if (getProfile) setOrg(getProfile) }, [getProfile])
  return { org, setOrg }
}
```


