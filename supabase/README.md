# Supabase setup (prepared, NOT yet connected or tested live)

The SQL in `migrations/` was syntax-checked but **has not been run against a live Supabase project**, and the
frontend adapter (`src/services/supabase/index.js`) is a stub. Do not claim real authentication works until you
have finished and tested the steps below. Demo Mode keeps working without any of this.

## 1. Create the project
1. Create a project at supabase.com. Authentication → Providers → enable **Email**. For a hackathon, you may turn off "Confirm email".
2. Project Settings → API: copy the **Project URL** and the **anon public** key into `.env` (see `.env.example`).
   **Never** put the `service_role` key in the frontend or in a `VITE_` variable.

## 2. Run the migrations (SQL Editor, in order)
1. `0001_schema.sql`: tables
2. `0002_functions.sql`: roles helpers, sign-up trigger (everyone starts as `student`), atomic RPCs (registration with waitlist, claims, handover, issue status)
3. `0003_rls.sql`: Row Level Security on every table
4. `0004_storage.sql`: private storage buckets

## 3. Make your first administrator
Sign up in the app (or Auth → Users → Add user), then in the SQL editor run once:
`update profiles set role = 'admin' where id = '<that user id>';`
Other roles are then assigned by that admin. Roles are never taken from sign-up data.

## 4. Verify security before trusting it
Open `tests/rls_checks.sql`, put two real user ids in, and run it. Any `FAIL` exception means a policy is wrong.

## 5. Finish the frontend adapter
`npm i @supabase/supabase-js`, then implement each method in `src/services/supabase/index.js` using the same names as
`src/services/local/index.js` (e.g. `registerEvent` → `supabase.rpc('register_event', { p_event })`), add email/password
sign-in to `features/auth/SignIn.jsx`, and set `SUPABASE_ADAPTER_READY = true`. Upload photos to the private buckets and show
them with signed URLs.

## Design notes
- Lost & Found private detail, contact, evidence and pickup codes live in separate tables with narrow policies. Reviewers never see the pickup code.
- Claims, registrations and status changes go through `SECURITY DEFINER` functions so capacity, disputes and ownership rules are enforced on the server.
- Anonymous suggestions: use the `feedback_public` view so author ids are hidden from non-admins.
