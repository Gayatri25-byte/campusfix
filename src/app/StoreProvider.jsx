// Shares app data and actions with every page through useStore().
// It talks only to `service`, so switching from demo to Supabase later does not change the pages.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { service } from '../services/index.js'
import { can as canDo } from '../config/roles.js'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

const ACTOR_KEY = 'campusfix.demoUser'
// DEMO ONLY: the "signed-in" person is just a remembered choice in this browser. It is not authentication.
const readActor = () => {
  try {
    return localStorage.getItem(ACTOR_KEY) || null
  } catch {
    return null
  }
}
const EMPTY = { stats: { reports: 0, fixed: 0, returned: 0, events: 0 }, me: null, users: [], issues: [], items: [], claims: [], events: [], regs: [], regCounts: {}, announcements: [], academic: [], schedule: [], feedback: [], notifications: [] }

export function StoreProvider({ children }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toast, setToast] = useState(null) // { msg, kind }

  const refresh = useCallback(async () => setData(await service.load()), [])

  useEffect(() => {
    service.setActor(readActor())
    refresh()
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const say = (msg, kind = 'ok') => setToast({ msg, kind })

  // Runs a service call, reloads data, shows a friendly message. Returns the result, or `false` on failure.
  const call = (fn, okMsg) => async (...args) => {
    try {
      const result = await fn(...args)
      await refresh()
      if (okMsg) say(typeof okMsg === 'function' ? okMsg(result) : okMsg)
      return result === undefined ? true : result
    } catch (e) {
      say(e.message || 'Something went wrong.', 'error')
      return false
    }
  }

  const store = useMemo(() => {
    const me = data.me
    return {
      ...data,
      role: me?.role || null,
      toast,
      say,
      can: (perm) => canDo(me, perm),
      isDemo: service.mode === 'demo',
      signIn: async (userId) => {
        try {
          localStorage.setItem(ACTOR_KEY, userId)
        } catch {
          /* demo convenience only */
        }
        service.setActor(userId)
        await refresh()
      },
      signOut: async () => {
        try {
          localStorage.removeItem(ACTOR_KEY)
        } catch {
          /* ignore */
        }
        service.setActor(null)
        await refresh()
      },
      addIssue: call((f) => service.addIssue(f), (id) => 'Report ' + id + ' submitted'),
      upvote: call((id) => service.upvoteIssue(id), 'Added: you are affected too'),
      assign: call((id, who) => service.assignIssue(id, who), 'Assigned'),
      advance: call((id, s) => service.setIssueStatus(id, s), 'Status updated'),
      resolve: call((id, n, p) => service.resolveIssue(id, n, p), 'Marked resolved. The reporter will be asked to verify.'),
      verify: call((id, ok, c) => service.verifyIssue(id, ok, c), (r) => 'Thanks for checking'),
      addItem: call((i) => service.addItem(i), 'Posted to Lost & Found'),
      closeItem: call((id) => service.closeItem(id), 'Marked as returned'),
      submitClaim: call((id, e) => service.submitClaim(id, e), 'Claim submitted. The reviewer will compare it privately.'),
      reviewClaim: call((id, d) => service.reviewClaim(id, d), (r) => 'Claim updated'),
      confirmHandover: call((id, c) => service.confirmHandover(id, c), 'Handover confirmed'),
      createEvent: call((f) => service.createEvent(f), (s) => (s === 'pending' ? 'Event sent for admin approval' : 'Event published')),
      reviewEvent: call((id, ok) => service.reviewEvent(id, ok), 'Decision saved'),
      registerEvent: call((id) => service.registerEvent(id), (s) => (s === 'waitlist' ? 'Event is full. You are on the waitlist.' : 'You are registered')),
      cancelRegistration: call((id) => service.cancelRegistration(id), 'Registration cancelled'),
      checkIn: call((e, u) => service.checkIn(e, u)),
      postAnnouncement: call((a) => service.postAnnouncement(a), 'Announcement posted'),
      postAcademic: call((a) => service.postAcademic(a), 'Academic update posted'),
      addFeedback: call((f) => service.addFeedback(f), 'Thanks. Your suggestion is live.'),
      voteFeedback: call((id) => service.voteFeedback(id)),
      moderateFeedback: call((id, p) => service.moderateFeedback(id, p), 'Moderation saved'),
      markRead: call((id) => service.markRead(id)),
      markAllRead: call(() => service.markAllRead()),
      setUserRole: call((id, r) => service.setUserRole(id, r), 'Role updated'),
      setUserActive: call((id, a) => service.setUserActive(id, a), 'Account updated'),
      resetDemo: call(() => service.resetDemo(), 'Demo data restored'),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, toast])

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-navy-500" role="status">
        Loading CampusFix…
      </div>
    )
  if (loadError)
    return (
      <div role="alert" className="p-8 text-rose-700">
        Could not load data: {loadError}. Try “Reset demo data” by clearing this site’s storage, then reload.
      </div>
    )

  return (
    <StoreContext.Provider value={store}>
      {children}
      {toast && (
        <div
          role={toast.kind === 'error' ? 'alert' : 'status'}
          className={`pop fixed bottom-5 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm text-white shadow-lift ${toast.kind === 'error' ? 'bg-rose-700' : 'bg-navy-900'}`}
        >
          {toast.msg}
        </div>
      )}
    </StoreContext.Provider>
  )
}
