# WiscoHome Buyer Dashboard

Internal admin and CRM dashboard for the Wisco Home Buyer team. It talks to
`wisco-home-buyer-server` (NestJS API) and is used by staff, not the public.

## Stack

- **Next.js** (App Router), React, TypeScript, Tailwind CSS
- **TanStack Query** for server state, **axios** for API calls (token refresh built in)
- **Zustand** for the auth store, **sonner** for toasts

> This Next.js version has breaking changes from older releases. Read the guide in
> `node_modules/next/dist/docs/` before changing routing or data fetching.

## Features

- **Leads**, **Buyers List**, **Properties**, **Public Records**, **Analytics**
- **Wholesale Listings**: create/edit listings (photos with a large-photo popup,
  video link, Public/Private, US state and ZIP autofill), a read-only detail page
  per listing, "Notify buyers" email, and **Interested buyers** with an unread badge
- **Activity Log** (Super Admin only; hidden from the sidebar for everyone else):
  who did what and when, with search, result and date filters. Needs the server
  `GET /api/activity-logs` deployed first
- **Settings** (role-based):
  - Profile and **Users & Roles**: invite, change role, disable/enable, remove
  - **Automation** (Super Admin): nightly public records pull on/off, interest
    email recipient, public website URL
  - **Database** (Super Admin): download a backup, restore from a file, and clear
    imported or all business data (typed confirmation, backup first)

## Getting started

```bash
cp .env.example .env     # set NEXT_PUBLIC_API_URL to the API origin
npm install
npm run dev -- -p 3001   # the API uses 3000 by default
```

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint (no errors; one `exhaustive-deps` warning in `PropertyDetailsCard`) |

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API origin, no trailing slash |

Never put secrets in `NEXT_PUBLIC_*` variables: they are shipped to the browser.

## Project structure

```
src/
├── app/            # routes: (auth-layout) login/invite/reset, leads, buyers, properties,
│                   #   wholesale-listings (+ /[id], /[id]/edit, /new, /interests), settings, ...
├── components/     # feature folders (leads, buyers, wholesale, settings, ...) and ui/
├── hooks/          # TanStack Query hooks, one file per feature
├── services/       # API clients (axios), one file per feature
├── store/          # Zustand auth store
├── lib/            # axios instance, helpers (us-states)
└── types/          # type shims (lucide-react icons are declared by hand here)
```

New icons from `lucide-react` must be declared in `src/types/lucide-react.d.ts`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs `tsc --noEmit` and the production
build on every pull request and on pushes to `main`. Lint runs too and a lint
error fails the check.

## Deployment

Built as a standard Next.js app. Set `NEXT_PUBLIC_API_URL` at build time. Deploy the
server first when a change depends on new API endpoints.
