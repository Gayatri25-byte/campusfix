# CampusFix

A Smart Campus Life & Services platform (React + Vite + Tailwind CSS + Lucide). One place for students, faculty, facility staff, event organizers and administrators.

> **Demo Mode.** All data is sample data stored in your own browser (localStorage). “Sign in” picks one of five invented people.
> It is **not authentication and not secure**. Real accounts and enforced permissions are prepared as Supabase SQL but **not connected**.

## Run it in VS Code

1. Install Node.js 18+ from nodejs.org.
2. File → Open Folder → the `campusfix` folder. Open the terminal and run:

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 87 automated tests
npm run build      # production build into dist/
npm run preview    # serve the production build (best for the live demo)
```

## What is in it

| Area | What works (in Demo Mode) |
|---|---|
| Roles | Student, Faculty, Facility Staff, Event Organizer, Administrator, each with its own nav, dashboard and allowed actions |
| Campus Care | Report with safety flag, duplicate suggestions, assignment, status history, proof of fix, reporter verification or reopening, notifications |
| Lost & Found | Private ownership evidence, claims, review, disputes (admin settles), pickup code, handover confirmation |
| Events | Types, registration, capacity, waitlist with auto-promotion, organizer proposals, admin approval, check-in |
| Academic | Timetable, exam/deadline calendar, notices, class updates, resources (sample) |
| Workspaces | Faculty (post updates), staff (queue, found-item desk), organizer (events) |
| Admin | Event approvals, users and roles, disputes, announcements, moderation |
| Community | Announcements by audience, suggestions with voting, anonymous posting, moderation |
| Campus | Illustrative map with open-issue pins, searchable sample directory |
| Analytics | Computed from the stored data and labelled with how much of it is sample data |

## Real vs simulated

**Real (works and is tested):** all workflows and rules above run against the browser data store; permission checks, privacy filtering of Lost & Found fields, capacity/waitlist logic, validation, notifications, persistence across reloads, responsive layout code, reduced-motion support.

**Simulated / not real:** sign-in (a persona picker), every “permission” (browser-side logic, trivially bypassed by anyone with dev tools), email delivery (none: notifications are in-app only), photos (stored as text in localStorage, about 5 MB limit), multi-user sync (none: each browser is its own world), people, names, timetable, phone extensions and map positions (invented).

**Prepared but unverified:** `supabase/` contains schema, RLS policies, RPC functions, storage rules and an RLS test script. They parse as valid SQL but have **not been run against a live Supabase project**, and the frontend adapter is a stub. See `supabase/README.md`.

## Structure

```
src/app/        App shell, layout, routing, store, error boundary
src/config/     roles + permissions, constants, nav, sample campus layout/directory
src/services/   data layer: local (demo) adapter in use, supabase adapter stub
src/features/   home, auth, care, lostfound, events, academic, community, campus, workspace, admin, analytics
src/components/ shared UI, campus illustration, campus map, demo banner
src/demo/       invented seed data
supabase/       migrations/ (SQL), tests/rls_checks.sql, README.md
tests/          service.test.js (rules) and ui.test.jsx (every page for every role + key flows)
```

Pages never touch storage. They call actions from `useStore()`, which call `service`. To add a feature, add a method to **both** adapters and expose it in `StoreProvider.jsx`.

Data is saved under `campusfix.demo.v3`. Older Phase 1 data (`campusfix.demo.v2`) is migrated automatically.

## Known limitations

- Not tested in a real browser by the author (no browser was available when building). Automated tests render every page in jsdom, which does not check visual layout, real animation, or real touch behaviour. **Look at it on a laptop and a phone before presenting.**
- No automated accessibility audit has been run (focus styles, skip link, labels, ARIA states and reduced-motion are implemented, but colour contrast and screen-reader behaviour are unverified).
- No real authentication, email, push notifications, or multi-user sync until Supabase is finished.
- The demo timetable is one shared sample, not per-student.
- Photos in localStorage fill up quickly; the app shows a message when storage is full.
- Fraunces / Instrument Sans load from Google Fonts; offline they fall back to system fonts.
