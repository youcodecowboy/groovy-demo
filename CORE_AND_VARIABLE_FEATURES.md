# Groovy App – Core vs Variable Features

This document tracks the persistent core features every tenant receives and the variable features that can be enabled per organization via onboarding or settings.

## Core Features (always present)
- Home: Landing in `/app` with guidance and recent activity.
- Workflow Builder: Define stages and actions.
- Messages: Team/factory messaging area.
- Settings: Organization and application configuration.

## Variable Features (tenant‑configurable)
- Dashboard Widgets: Capacity, Calendar, Live Feed, KPIs, etc.
- Items: Item creation, lists, and tracking.
- Locations: Location management and history.
- Notifications: System/user notifications.
- Tasks: Assignment and tracking.
- Purchase Orders: PO creation and tracking.
- Factory Floor: Operator UI for active items/stations.
- Approvals: Gate actions requiring review.
- Quality/Defects: Defective/flagged item flows.

## Notes
- All server queries/mutations must be scoped by `orgId` using `resolveOrgId(ctx)`.
- UI should read capabilities from org settings to show/hide variable features.
- Onboarding should generate initial settings, default dashboard, and starter workflows.


