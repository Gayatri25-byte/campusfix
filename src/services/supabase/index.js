// PLACEHOLDER for the real backend. NOT connected and NOT tested against a live Supabase project.
// The database schema, RLS policies and storage rules are ready in /supabase/migrations.
// To finish: `npm i @supabase/supabase-js`, implement each method below with supabase-js calls
// (auth.signInWithPassword, from('issues').insert, rpc('submit_claim'), ...), then set READY = true.
// It must offer exactly the same methods as src/services/local/index.js.
export const SUPABASE_ADAPTER_READY = false

const notReady = async () => {
  throw new Error('The Supabase adapter is not finished yet. See supabase/README.md.')
}
const names = `setActor load addIssue upvoteIssue assignIssue setIssueStatus resolveIssue verifyIssue addItem closeItem
submitClaim reviewClaim confirmHandover createEvent reviewEvent registerEvent cancelRegistration checkIn postAnnouncement
postAcademic addFeedback voteFeedback moderateFeedback markRead markAllRead setUserRole setUserActive resetDemo`.split(/\s+/)

export const supabaseService = { mode: 'supabase', ...Object.fromEntries(names.map((n) => [n, notReady])) }
