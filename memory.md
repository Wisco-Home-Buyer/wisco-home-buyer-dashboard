# Wisco Home Buyer — Dashboard (internal CRM)

## Project concept
Admin/CRM dashboard for the Wisco Home Buyer team to manage seller leads, buyers list, property data and users. Talks to `wisco-home-buyer-server`. Parent folder has `PROJECT_OVERVIEW.md`.

## Tech stack and architecture
Next.js, TypeScript, Tailwind + shadcn/Radix, TanStack Query/Table, Zustand (auth), axios, react-hook-form + zod, Recharts, Leaflet, socket.io-client, framer-motion.
- Data flow: `src/services/*.service.ts` (axios) -> `src/hooks/use*Query.ts` (TanStack Query).
- Auth: `src/proxy.ts` redirects to `/login` when `accessToken`/`refreshToken` cookies are missing.
- Pages: `/` overview, `/leads` (+`[id]`), `/buyers`, `/properties` (+`[id]`), `/ascent-data`, `/attom-data`, `/analytics`, `/settings`; auth pages `/login`, `/accept-invite`, `/forgot-password`, `/reset-password`.

## Current state
Feature complete for current scope; no TODO/mock leftovers found in `src`.

## Key decisions
- Ascent (county records) is the source of truth for ownership/tax; ATTOM auto-pull is disabled. ATTOM runs a mock without an API key, so do not demo its values as real.
- Roles: SUPER_ADMIN > ADMIN > ANALYST > VIEWER.

## Setup and run
`npm install`, `npm run dev` (port 3001 to match server CORS). Uses `NEXT_PUBLIC_API_URL`.

## Last updated
2026-10-14 — memory.md created.

## Wholesale listings (branch feat/wholesale-listings, 2026-10-16, uncommitted)
- New sidebar item and pages `/wholesale-listings` (table), `/new`, `/[id]` (edit). Table has 'Notify buyers' (confirm dialog, shows last-sent time). Form uploads photos via `/api/uploads/listing-images`. `lucide-react` icons are hand-declared in `src/types/lucide-react.d.ts`; add new icons there.
- `npm run lint` is broken on baseline (ESLint config circular-JSON error), not caused by this work.

## User status controls (branch feat/user-status-controls, 2026-10-16, uncommitted)
- Settings > Users & Roles: per-row Disable/Enable and Remove with confirm dialog (hidden for yourself; SUPER_ADMIN rows only for SUPER_ADMIN). Status type is `SUSPENDED` (was wrongly `DISABLED`). Needs the matching server endpoint deployed first.

## Interested buyers (branch feat/listing-interests, 2026-10-16, uncommitted)
- `/wholesale-listings/interests` lists public "I'm interested" requests (linked from the listings page). Needs the server `GET /api/wholesale-listings/interests` deployed first.

## Detail pages and unread badge (branch feat/listing-detail-pages, 2026-10-16, uncommitted)
- Routes: `/wholesale-listings/[id]` is now a read-only detail page (photos with popup, interested buyers for that listing); the edit form moved to `/wholesale-listings/[id]/edit`. `/wholesale-listings/interests/[id]` shows one request and marks it read. Unread count badge on the listings page button and sidebar (polls every 60s); 'Mark all as read' on the interests list.
- Needs server endpoints from feat/interest-read-status deployed first (`/interests/unread-count`, `/interests/:id`, `/interests/:id/read`, `/interests/read-all`).

## Database backup/restore UI (branch feat/database-backup-ui, 2026-10-16, uncommitted)
- Settings > Database tab (SUPER_ADMIN only): download backup (`GET /api/backup`) and restore (`POST /api/backup/restore`, must type RESTORE; signs you out after). Server endpoints already existed; backup downloads into browser memory (fine for current size).

## Data cleanup card (branch feat/data-cleanup-ui, stacked on feat/database-backup-ui, 2026-10-16)
- Settings > Database shows 'Clear imported data': live counts, two checkboxes, backup acknowledgement and typing DELETE. Needs server `/api/data-cleanup/*` deployed.

## Automation settings tab (branch feat/app-settings-ui, stacked on feat/data-cleanup-ui, 2026-10-16, uncommitted)
- Settings > Automation (SUPER_ADMIN): toggle/edit the runtime settings, 'Reset to default'. Needs server `/api/app-settings` deployed.
