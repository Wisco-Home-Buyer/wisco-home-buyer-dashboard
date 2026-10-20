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
- `npm run lint` works and is clean (0 errors, 1 `exhaustive-deps` warning in `PropertyDetailsCard`) since 2026-10-16; CI lint is blocking. Two effects keep an `eslint-disable react-hooks/set-state-in-effect` with a reason (Header theme, CompanyProfileForm). Removed the unused `lib/api-client.ts` and `lib/auth-service.ts` (the app uses `lib/axios.ts` and `services/auth.service.ts`).

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

## Cleanup card: Everything option (branch feat/cleanup-all-data-ui, stacked on feat/app-settings-ui, 2026-10-16)
- Third option 'Everything' in Settings > Database > Clear imported data; requires typing `DELETE EVERYTHING` plus the backup tick.

## Listing video upload (branch feat/listing-video-upload, 2026-10-16)
- Listing form: video is uploaded (MP4/MOV/WEBM, up to 200 MB, with progress) to `POST /api/uploads/listing-video`; the YouTube link field is gone (old external links still show and can be removed). Detail page plays the video. `lib/video.ts` tells an uploaded file from an external link. Needs the server video endpoint deployed first.

## Stored backups card (branch feat/stored-backups-ui, 2026-10-16)
- Settings > Database shows 'Automatic backups': the nightly backups kept on the server (download each) and 'Back up now'. Needs the server `/api/backup/scheduled` endpoints deployed.

## Resend invite button (branch feat/resend-invite, 2026-10-16)
- Settings > Users & Roles: pending members get a 'Resend invite' button next to Remove (shows the link in a toast when email is off). Needs server `POST /api/users/:id/resend-invite` deployed first.

## Resend invite countdown (branch feat/resend-invite-cooldown, 2026-10-16)
- The Resend invite button locks for 300s (5 minutes) after a send and shows 'Resend in m:ss' (uses `users.inviteSentAt` from the list plus a local timestamp; `INVITE_RESEND_COOLDOWN_SECONDS` in `services/users.service.ts` mirrors the server). Needs the server cooldown PR deployed first.

## Unused files card (branch feat/unused-files-ui, 2026-10-16)
- Settings > Database shows 'Unused uploaded files' (count and size from `GET /api/uploads/unused`) with 'Delete unused files' (`POST /api/uploads/unused/clean`). Needs the server endpoints deployed first.

## Visibility Both (branch feat/visibility-both, 2026-10-17)
- Listing form/filter/detail know `BOTH` (label 'Both (Wholesale Listings + Buyers List)'). Needs server `ListingVisibility.BOTH` deployed first (the migration adds the enum value).

## Activity log (branch feat/activity-logs, 2026-10-17)
- `/activity-logs` page (`ActivityLogsTable`, `useActivityLogs`, `activityLogs.service`). Sidebar item and page content only for SUPER_ADMIN; server enforces the same. Needs server PR #25 deployed first.

## Photo upload batches (branch fix/listing-photo-batches, 2026-10-19)
- Listing form uploads photos 5 at a time (server accepts max 10 files per request; the form allows 20). A failed batch now reports how many photos were added.
- Photo picker accepts any image type (JPG/PNG/HEIC/WEBP), checks 100 MB per photo, error toasts stay 10 s (branch fix/listing-photo-feedback, 2026-10-19). Needs server PR "accept more photo formats" deployed.
- Activity log rows show "Why it failed" (server `errorMessage`, PR feat/activity-log-reason, 2026-10-19). Needs server deployed first.
- Listing photo thumbnails use lazy loading (branch fix/lazy-photo-thumbnails, 2026-10-19).
- Listing photos in the table, form grid and detail grid load resized copies via `photoUrl()` (`/api/images/<file>?w=400`, lightbox 1600), branch feat/dashboard-resized-photos, 2026-10-21. Needs the server image-variants PRs deployed.
