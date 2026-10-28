// Roles and permissions.
// IMPORTANT: in Demo Mode these checks run in the browser, so they are a convenience, NOT security.
// In real mode the same rules are enforced by PostgreSQL Row Level Security (see supabase/migrations).
export const ROLE_LIST = ['student', 'faculty', 'staff', 'organizer', 'admin']
export const ROLE_LABEL = {
  student: 'Student',
  faculty: 'Faculty',
  staff: 'Facility Staff',
  organizer: 'Event Organizer',
  admin: 'Administrator',
}
const base = ['report', 'claim', 'register', 'feedback', 'vote']
export const PERMS = {
  student: base,
  faculty: [...base, 'post_notice', 'post_academic', 'propose_event'],
  staff: [...base, 'post_notice', 'handle_issues', 'review_found', 'handover'],
  organizer: [...base, 'propose_event', 'checkin'],
  admin: ['*'],
}
export const can = (user, perm) =>
  Boolean(user) && (PERMS[user.role]?.includes('*') || PERMS[user.role]?.includes(perm) || false)
