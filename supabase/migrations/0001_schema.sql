-- CampusFix schema. NOT YET RUN against a live Supabase project (see supabase/README.md).
create extension if not exists pgcrypto;

create type app_role as enum ('student','faculty','staff','organizer','admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role app_role not null default 'student',
  dept text, team text, club text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table issues (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references profiles(id),
  title text not null check (char_length(title) between 5 and 120),
  category text not null,
  location text not null check (char_length(location) > 0),
  description text not null check (char_length(description) >= 15),
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')),
  safety boolean not null default false,
  status text not null default 'Submitted' check (status in ('Submitted','Assigned','In Progress','Resolved','Verified')),
  assignee text,
  photo_path text,
  proof_note text, proof_photo_path text, proof_at timestamptz,
  created_at timestamptz not null default now()
);
create table issue_affected (issue_id bigint references issues(id) on delete cascade, user_id uuid references profiles(id), primary key (issue_id, user_id));
create table issue_events (
  id bigint generated always as identity primary key,
  issue_id bigint not null references issues(id) on delete cascade,
  status text not null, note text not null, actor_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table items (
  id bigint generated always as identity primary key,
  poster_id uuid not null references profiles(id),
  type text not null check (type in ('lost','found')),
  item text not null check (char_length(item) >= 3),
  location text not null,
  status text not null default 'open' check (status in ('open','claim_pending','disputed','ready_for_pickup','returned')),
  created_at timestamptz not null default now()
);
-- Private Lost & Found data lives in its own tables so RLS can hide it from everyone else.
create table item_private (
  item_id bigint primary key references items(id) on delete cascade,
  private_detail text not null default '',
  contact text not null default ''
);
create table claims (
  id bigint generated always as identity primary key,
  item_id bigint not null references items(id) on delete cascade,
  claimant_id uuid not null references profiles(id),
  evidence text not null check (char_length(evidence) >= 15),
  status text not null default 'pending' check (status in ('pending','approved','rejected','collected')),
  decided_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (item_id, claimant_id)
);
-- The pickup code is visible ONLY to the claimant (reviewers never see it); handover checks it server-side.
create table claim_pickup (claim_id bigint primary key references claims(id) on delete cascade, claimant_id uuid not null references profiles(id), code text not null);

create table events (
  id bigint generated always as identity primary key,
  organizer_id uuid not null references profiles(id),
  title text not null check (char_length(title) >= 4),
  type text not null, description text not null default '', location text not null default 'To be announced', club text,
  starts_at timestamptz not null,
  capacity int not null check (capacity >= 1),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create table registrations (
  id bigint generated always as identity primary key,
  event_id bigint not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id),
  status text not null check (status in ('registered','waitlist','cancelled')),
  checked_in boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index registrations_one_active on registrations (event_id, user_id) where status <> 'cancelled';

create table announcements (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id),
  title text not null, body text not null,
  audience text not null default 'all' check (audience in ('all','student','faculty','staff','organizer','admin')),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create table academic_items (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id),
  kind text not null check (kind in ('notice','exam','deadline','class_update')),
  title text not null, detail text not null default '', course text, due_at timestamptz,
  created_at timestamptz not null default now()
);
create table schedule (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id), faculty_id uuid references profiles(id),
  day text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat')),
  start_time time not null, end_time time not null, course text not null, room text not null
);
create table feedback (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id),
  title text not null check (char_length(title) >= 5), body text not null check (char_length(body) >= 10),
  category text not null, anonymous boolean not null default false,
  status text not null default 'Open' check (status in ('Open','Under review','Planned','Done')),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create table feedback_votes (feedback_id bigint references feedback(id) on delete cascade, user_id uuid references profiles(id), primary key (feedback_id, user_id));
create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  text text not null, link text not null default 'dashboard', read boolean not null default false,
  created_at timestamptz not null default now()
);
