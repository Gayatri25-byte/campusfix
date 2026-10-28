// DEMO ADAPTER: stores everything in this browser's localStorage.
// It is NOT secure and NOT shared between users. Permission checks here are logic demos that run in the
// browser; real enforcement happens in PostgreSQL Row Level Security (see supabase/migrations).
//
// Every adapter must offer the same methods (the Supabase adapter mirrors this list):
//   setActor(userId|null)  load()
//   Care:      addIssue upvoteIssue assignIssue setIssueStatus resolveIssue verifyIssue
//   Lost&Found addItem closeItem submitClaim reviewClaim confirmHandover
//   Events:    createEvent reviewEvent registerEvent cancelRegistration checkIn
//   Community: postAnnouncement postAcademic addFeedback voteFeedback moderateFeedback
//   Other:     markRead markAllRead setUserRole setUserActive resetDemo
import { buildSeedData } from '../../demo/seed.js'
import { can, ROLE_LIST } from '../../config/roles.js'

const KEY = 'campusfix.demo.v3'
const OLD_KEY = 'campusfix.demo.v2'
const VERSION = 3
const now = () => new Date().toISOString()
const uid = (p) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const read = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k))
  } catch {
    return null
  }
}
const fresh = () => ({ version: VERSION, ...buildSeedData() })

function initialDb() {
  const cur = read(KEY)
  if (cur?.version === VERSION && Array.isArray(cur.issues) && Array.isArray(cur.users)) return cur
  const old = read(OLD_KEY) // Phase 1 data: keep the reports and items the person created
  if (old && Array.isArray(old.issues) && Array.isArray(old.items)) {
    const seed = fresh()
    return {
      ...seed,
      issues: old.issues.map(({ mine, ...i }) => ({
        safety: false,
        ...i,
        reporterId: mine ? 'u-student' : 'u-s2',
        affectedBy: [mine ? 'u-student' : 'u-s2'],
      })),
      items: old.items.map(({ claimed, ...x }) => ({
        privateDetail: '',
        ...x,
        status: claimed ? 'returned' : 'open',
        posterId: 'u-s2',
      })),
      claims: [],
    }
  }
  return fresh()
}

let db = initialDb()
let actorId = null

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    throw new Error('Browser storage is full. Remove photos or reset the demo data.')
  }
}
const change = (patch) => {
  db = { ...db, ...patch }
  save()
}
const actor = () => db.users.find((u) => u.id === actorId && u.active) || null
const userName = (id) => db.users.find((u) => u.id === id)?.name || 'Someone'

function need(perm) {
  const a = actor()
  if (!a) throw new Error('Please sign in first.')
  if (perm && !can(a, perm)) throw new Error('Your role (' + a.role + ') is not allowed to do that.')
  return a
}
const isAdmin = (a) => a.role === 'admin'

function notify(userIds, text, link = 'dashboard') {
  const list = [...new Set(userIds)].filter(Boolean)
  const rows = list.map((userId) => ({ id: uid('N'), userId, text, link, at: now(), read: false }))
  db = { ...db, notifications: [...rows, ...db.notifications].slice(0, 300) }
}
const idsWhere = (fn) => db.users.filter((u) => u.active && fn(u)).map((u) => u.id)

const step = (issue, status, note, by) => ({
  ...issue,
  status,
  timeline: [...issue.timeline, { status, note, at: now(), by }],
})
function updateIssue(id, fn) {
  const found = db.issues.find((i) => i.id === id)
  if (!found) throw new Error('Issue ' + id + ' was not found.')
  const next = fn(found)
  db = { ...db, issues: db.issues.map((i) => (i.id === id ? next : i)) }
  return next
}
const nextIssueId = () => {
  const nums = db.issues.map((i) => Number(String(i.id).replace('CF-', ''))).filter(Number.isFinite)
  return 'CF-' + (Math.max(1000, ...nums) + 1)
}
const confirmedCount = (eventId) => db.regs.filter((r) => r.eventId === eventId && r.status === 'registered').length

// What the signed-in person is allowed to see. Private Lost & Found fields are removed here,
// so the screens never receive them (the same idea RLS applies in the real backend).
function view() {
  const a = actor()
  const staffLike = a && (isAdmin(a) || can(a, 'review_found'))
  const items = db.items.map((x) => {
    const priv = a && (staffLike || x.posterId === a.id)
    if (priv) return x
    const { privateDetail, contact, ...pub } = x
    return { ...pub, hasPrivate: Boolean(privateDetail) }
  })
  const claims = a
    ? db.claims
        .filter((c) => staffLike || c.claimantId === a.id || db.items.find((i) => i.id === c.itemId)?.posterId === a.id)
        .map((c) => (c.claimantId === a.id ? c : { ...c, pickupCode: undefined }))
    : []
  const audienceOk = (x) => x.audience === 'all' || (a && (x.audience === a.role || isAdmin(a)))
  const mod = a && isAdmin(a)
  return {
    me: a ? { ...a } : null,
    users: db.users.map(({ id, name, role, dept, team, club, active, demo }) => ({ id, name, role, dept, team, club, active, demo })),
    issues: a ? db.issues : [], // signed-out visitors only get the aggregate counts below
    items: a ? items : [],
    stats: {
      reports: db.issues.length,
      fixed: db.issues.filter((i) => ['Resolved', 'Verified'].includes(i.status)).length,
      returned: db.items.filter((i) => i.status === 'returned').length,
      events: db.events.filter((e) => e.status === 'approved').length,
    },
    claims,
    events: db.events.filter((e) => e.status === 'approved' || (a && (isAdmin(a) || e.organizerId === a.id))),
    regs: a ? db.regs.filter((r) => r.userId === a.id || isAdmin(a) || db.events.find((e) => e.id === r.eventId)?.organizerId === a.id) : [],
    regCounts: Object.fromEntries(db.events.map((e) => [e.id, { registered: confirmedCount(e.id), waitlist: db.regs.filter((r) => r.eventId === e.id && r.status === 'waitlist').length }])),
    announcements: db.announcements.filter(audienceOk),
    academic: a ? db.academic : [],
    schedule: a ? db.schedule : [],
    feedback: db.feedback
      .filter((f) => !f.hidden || mod)
      .map((f) => ({
        ...f,
        votes: db.votes.filter((v) => v.feedbackId === f.id).length,
        voted: a ? db.votes.some((v) => v.feedbackId === f.id && v.userId === a.id) : false,
        author: f.anonymous && !mod ? 'Anonymous' : userName(f.authorId),
        mine: a ? f.authorId === a.id : false,
      })),
    notifications: a ? db.notifications.filter((n) => n.userId === a.id) : [],
  }
}

export const localService = {
  mode: 'demo',
  setActor(id) {
    actorId = id
  },
  async load() {
    return view()
  },

  // ---------- Campus Care ----------
  async addIssue(form) {
    const a = need('report')
    const id = nextIssueId()
    const safety = Boolean(form.safety)
    const issue = {
      id,
      title: form.title,
      category: form.category,
      location: form.location,
      description: form.description,
      photo: form.photo || null,
      priority: safety ? 'High' : form.priority,
      safety,
      status: 'Submitted',
      createdAt: now(),
      assignee: null,
      affected: 1,
      affectedBy: [a.id],
      reporterId: a.id,
      proof: null,
      demo: false,
      timeline: [{ status: 'Submitted', note: safety ? 'Report received and flagged as a safety concern' : 'Report received', at: now(), by: a.name }],
    }
    db = { ...db, issues: [issue, ...db.issues] }
    notify(idsWhere((u) => u.role === 'admin' || (safety && u.team === 'Security Office')), (safety ? 'SAFETY report ' : 'New report ') + id + ': ' + issue.title, 'care-desk')
    save()
    return id
  },
  async upvoteIssue(id) {
    const a = need()
    const issue = db.issues.find((i) => i.id === id)
    if (!issue) throw new Error('Issue ' + id + ' was not found.')
    if (issue.affectedBy.includes(a.id)) throw new Error('You already added your voice to this report.')
    updateIssue(id, (i) => ({ ...i, affected: i.affected + 1, affectedBy: [...i.affectedBy, a.id] }))
    save()
  },
  async assignIssue(id, team) {
    const a = need('handle_issues')
    updateIssue(id, (i) => step({ ...i, assignee: team }, i.status === 'Submitted' ? 'Assigned' : i.status, 'Assigned to ' + team, a.name))
    const i = db.issues.find((x) => x.id === id)
    notify([i.reporterId], 'Your report ' + id + ' was assigned to ' + team + '.', 'reports')
    notify(idsWhere((u) => u.team === team), 'New assignment: ' + id + ' ' + i.title, 'care-desk')
    save()
  },
  async setIssueStatus(id, status) {
    const a = need('handle_issues')
    const i = updateIssue(id, (x) => step(x, status, 'Status changed to ' + status, a.name))
    notify([i.reporterId], 'Your report ' + id + ' is now ' + status + '.', 'reports')
    save()
  },
  async resolveIssue(id, note, photo) {
    const a = need('handle_issues')
    if (!note || note.trim().length < 5) throw new Error('Describe what was fixed (5+ characters).')
    const i = updateIssue(id, (x) => ({ ...step(x, 'Resolved', 'Fix completed with proof uploaded', a.name), proof: { note, photo: photo || null, at: now(), by: a.name } }))
    notify([i.reporterId], 'Your report ' + id + ' was fixed. Please verify it.', 'proof')
    save()
  },
  async verifyIssue(id, isFixed, comment) {
    const a = need()
    const found = db.issues.find((i) => i.id === id)
    if (!found) throw new Error('Issue ' + id + ' was not found.')
    if (found.reporterId !== a.id) throw new Error('Only the person who reported this issue can verify it.')
    if (found.status !== 'Resolved') throw new Error('This issue is not waiting for verification.')
    updateIssue(id, (i) =>
      isFixed
        ? step(i, 'Verified', 'Reporter confirmed the fix', a.name)
        : { ...step(i, 'In Progress', 'Reporter says it is not fixed: ' + (comment || 'no details'), a.name), proof: null },
    )
    if (!isFixed) notify(idsWhere((u) => u.role === 'admin' || u.team === found.assignee), 'Report ' + id + ' was reopened by the reporter.', 'care-desk')
    save()
  },

  // ---------- Lost & Found ----------
  async addItem(item) {
    const a = need()
    if (!item.item || item.item.trim().length < 3) throw new Error('Name the item (3+ characters).')
    if (!item.location?.trim()) throw new Error('Say where it was lost or found.')
    if (item.type === 'found' && !item.privateDetail?.trim())
      throw new Error('Add a private detail only the owner would know. It is never shown publicly.')
    const entry = {
      id: uid('LF'),
      type: item.type,
      item: item.item.trim(),
      location: item.location.trim(),
      contact: item.contact?.trim() || '',
      privateDetail: item.privateDetail?.trim() || '',
      date: now(),
      status: 'open',
      posterId: a.id,
      demo: false,
    }
    change({ items: [entry, ...db.items] })
  },
  async closeItem(id) {
    const a = need()
    const it = db.items.find((x) => x.id === id)
    if (!it) throw new Error('Item not found.')
    if (it.type !== 'lost' && !isAdmin(a)) throw new Error('Found items are closed through the claim and handover process.')
    if (it.posterId !== a.id && !isAdmin(a) && !can(a, 'review_found')) throw new Error('Only the person who posted this can close it.')
    change({ items: db.items.map((x) => (x.id === id ? { ...x, status: 'returned' } : x)) })
  },
  async submitClaim(itemId, evidence) {
    const a = need('claim')
    const it = db.items.find((x) => x.id === itemId)
    if (!it || it.type !== 'found') throw new Error('Only found items can be claimed.')
    if (it.status === 'returned' || it.status === 'ready_for_pickup') throw new Error('This item is no longer open for claims.')
    if (it.posterId === a.id) throw new Error('You cannot claim an item you posted.')
    if (db.claims.some((c) => c.itemId === itemId && c.claimantId === a.id && c.status !== 'rejected'))
      throw new Error('You already have a claim on this item.')
    if (!evidence || evidence.trim().length < 15) throw new Error('Describe something only the owner would know (15+ characters).')
    const claim = { id: uid('CL'), itemId, claimantId: a.id, evidence: evidence.trim(), status: 'pending', pickupCode: null, at: now() }
    const pending = db.claims.filter((c) => c.itemId === itemId && c.status === 'pending').length + 1
    db = {
      ...db,
      claims: [claim, ...db.claims],
      items: db.items.map((x) => (x.id === itemId ? { ...x, status: pending > 1 ? 'disputed' : 'claim_pending' } : x)),
    }
    notify([it.posterId, ...(pending > 1 ? idsWhere((u) => u.role === 'admin') : [])], (pending > 1 ? 'Disputed claims on ' : 'New claim on ') + it.item, 'lostfound')
    save()
  },
  async reviewClaim(claimId, decision) {
    const a = need()
    const claim = db.claims.find((c) => c.id === claimId)
    if (!claim) throw new Error('Claim not found.')
    const it = db.items.find((x) => x.id === claim.itemId)
    const reviewer = isAdmin(a) || can(a, 'review_found') || it.posterId === a.id
    if (!reviewer) throw new Error('You cannot review this claim.')
    if (claim.status !== 'pending') throw new Error('This claim was already decided.')
    if (it.status === 'disputed' && !isAdmin(a)) throw new Error('Competing claims must be settled by an administrator.')
    if (decision === 'approve') {
      const code = String(Math.floor(1000 + Math.random() * 9000))
      db = {
        ...db,
        claims: db.claims.map((c) =>
          c.id === claimId ? { ...c, status: 'approved', pickupCode: code, decidedBy: a.id } : c.itemId === it.id && c.status === 'pending' ? { ...c, status: 'rejected' } : c,
        ),
        items: db.items.map((x) => (x.id === it.id ? { ...x, status: 'ready_for_pickup' } : x)),
      }
      notify([claim.claimantId], 'Claim approved for ' + it.item + '. Your pickup code is in Lost & Found. Show it at handover.', 'lostfound')
    } else {
      db = { ...db, claims: db.claims.map((c) => (c.id === claimId ? { ...c, status: 'rejected', decidedBy: a.id } : c)) }
      const left = db.claims.filter((c) => c.itemId === it.id && c.status === 'pending').length
      db = { ...db, items: db.items.map((x) => (x.id === it.id ? { ...x, status: left > 1 ? 'disputed' : left === 1 ? 'claim_pending' : 'open' } : x)) }
      notify([claim.claimantId], 'Your claim on ' + it.item + ' was not approved.', 'lostfound')
    }
    save()
  },
  async confirmHandover(claimId, code) {
    const a = need()
    const claim = db.claims.find((c) => c.id === claimId)
    if (!claim || claim.status !== 'approved') throw new Error('No approved claim to hand over.')
    const it = db.items.find((x) => x.id === claim.itemId)
    if (!(isAdmin(a) || can(a, 'handover') || it.posterId === a.id)) throw new Error('You cannot confirm handovers.')
    if (String(code).trim() !== claim.pickupCode) throw new Error('That pickup code does not match.')
    db = {
      ...db,
      claims: db.claims.map((c) => (c.id === claimId ? { ...c, status: 'collected', collectedAt: now() } : c)),
      items: db.items.map((x) => (x.id === it.id ? { ...x, status: 'returned' } : x)),
    }
    notify([claim.claimantId], 'Handover confirmed for ' + it.item + '. Glad it is back with you.', 'lostfound')
    save()
  },

  // ---------- Events ----------
  async createEvent(f) {
    const a = need('propose_event')
    if (!f.title || f.title.trim().length < 4) throw new Error('Give the event a title (4+ characters).')
    if (!f.startsAt || Number.isNaN(new Date(f.startsAt).getTime())) throw new Error('Choose a valid date and time.')
    if (new Date(f.startsAt) < new Date()) throw new Error('The event date must be in the future.')
    const capacity = Number(f.capacity)
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Capacity must be a whole number of at least 1.')
    const ev = {
      id: uid('EV'),
      title: f.title.trim(),
      type: f.type,
      startsAt: new Date(f.startsAt).toISOString(),
      location: f.location?.trim() || 'To be announced',
      capacity,
      description: f.description?.trim() || '',
      club: f.club?.trim() || a.club || 'Campus',
      status: isAdmin(a) ? 'approved' : 'pending',
      organizerId: a.id,
      demo: false,
    }
    change({ events: [ev, ...db.events] })
    if (ev.status === 'pending') {
      notify(idsWhere((u) => u.role === 'admin'), 'Event awaiting approval: ' + ev.title, 'admin')
      save()
    }
    return ev.status
  },
  async reviewEvent(id, approve) {
    const a = need('*')
    const ev = db.events.find((e) => e.id === id)
    if (!ev) throw new Error('Event not found.')
    change({ events: db.events.map((e) => (e.id === id ? { ...e, status: approve ? 'approved' : 'rejected', reviewedBy: a.id } : e)) })
    notify([ev.organizerId], 'Your event "' + ev.title + '" was ' + (approve ? 'approved and is now public.' : 'not approved.'), 'events')
    save()
  },
  async registerEvent(id) {
    const a = need('register')
    const ev = db.events.find((e) => e.id === id)
    if (!ev || ev.status !== 'approved') throw new Error('This event is not open for registration.')
    if (new Date(ev.startsAt) < new Date()) throw new Error('This event has already started.')
    if (db.regs.some((r) => r.eventId === id && r.userId === a.id && r.status !== 'cancelled')) throw new Error('You are already registered or waitlisted.')
    const status = confirmedCount(id) < ev.capacity ? 'registered' : 'waitlist'
    change({ regs: [{ id: uid('R'), eventId: id, userId: a.id, status, checkedIn: false, at: now() }, ...db.regs] })
    return status
  },
  async cancelRegistration(id) {
    const a = need()
    const mine = db.regs.find((r) => r.eventId === id && r.userId === a.id && r.status !== 'cancelled')
    if (!mine) throw new Error('You are not registered for this event.')
    const wasConfirmed = mine.status === 'registered'
    let regs = db.regs.map((r) => (r.id === mine.id ? { ...r, status: 'cancelled' } : r))
    let promoted = null
    if (wasConfirmed) {
      promoted = regs.filter((r) => r.eventId === id && r.status === 'waitlist').sort((x, y) => x.at.localeCompare(y.at))[0]
      if (promoted) regs = regs.map((r) => (r.id === promoted.id ? { ...r, status: 'registered' } : r))
    }
    db = { ...db, regs }
    if (promoted) notify([promoted.userId], 'A seat opened up. You are now registered for ' + db.events.find((e) => e.id === id).title + '.', 'events')
    save()
  },
  async checkIn(eventId, userId) {
    const a = need('checkin')
    const ev = db.events.find((e) => e.id === eventId)
    if (!ev || (ev.organizerId !== a.id && !isAdmin(a))) throw new Error('You can only check in attendees for your own events.')
    const r = db.regs.find((x) => x.eventId === eventId && x.userId === userId && x.status === 'registered')
    if (!r) throw new Error('That person does not have a confirmed registration.')
    change({ regs: db.regs.map((x) => (x.id === r.id ? { ...x, checkedIn: !x.checkedIn } : x)) })
  },

  // ---------- Announcements, academic, feedback ----------
  async postAnnouncement({ title, body, audience, pinned }) {
    const a = need('post_notice')
    if (!title?.trim() || !body?.trim()) throw new Error('Add a title and a message.')
    if (audience !== 'all' && !ROLE_LIST.includes(audience)) throw new Error('Unknown audience.')
    const row = { id: uid('AN'), title: title.trim(), body: body.trim(), audience, pinned: Boolean(pinned) && isAdmin(a), authorId: a.id, at: now(), demo: false }
    db = { ...db, announcements: [row, ...db.announcements] }
    notify(idsWhere((u) => u.id !== a.id && (audience === 'all' || u.role === audience)), 'Announcement: ' + row.title, 'community')
    save()
  },
  async postAcademic({ kind, title, detail, course, dueAt }) {
    const a = need('post_academic')
    if (!title?.trim()) throw new Error('Add a title.')
    if (!['notice', 'exam', 'deadline', 'class_update'].includes(kind)) throw new Error('Unknown type.')
    if (kind !== 'class_update' && kind !== 'notice' && !dueAt) throw new Error('Choose a date for this ' + kind + '.')
    const row = { id: uid('AC'), kind, title: title.trim(), detail: detail?.trim() || '', course: course?.trim() || '', at: now(), dueAt: dueAt ? new Date(dueAt).toISOString() : null, authorId: a.id, demo: false }
    db = { ...db, academic: [row, ...db.academic] }
    notify(idsWhere((u) => u.role === 'student'), 'Academic update: ' + row.title, 'academic')
    save()
  },
  async addFeedback({ title, body, category, anonymous }) {
    const a = need('feedback')
    if (!title?.trim() || title.trim().length < 5) throw new Error('Give a title of at least 5 characters.')
    if (!body?.trim() || body.trim().length < 10) throw new Error('Add at least 10 characters of detail.')
    const row = { id: uid('FB'), title: title.trim(), body: body.trim(), category, authorId: a.id, anonymous: Boolean(anonymous), status: 'Open', hidden: false, at: now(), demo: false }
    change({ feedback: [row, ...db.feedback] })
  },
  async voteFeedback(id) {
    const a = need('vote')
    const has = db.votes.some((v) => v.feedbackId === id && v.userId === a.id)
    change({ votes: has ? db.votes.filter((v) => !(v.feedbackId === id && v.userId === a.id)) : [...db.votes, { feedbackId: id, userId: a.id }] })
  },
  async moderateFeedback(id, patch) {
    need('*')
    const allowed = {}
    if ('hidden' in patch) allowed.hidden = Boolean(patch.hidden)
    if ('status' in patch) allowed.status = patch.status
    change({ feedback: db.feedback.map((f) => (f.id === id ? { ...f, ...allowed } : f)) })
  },

  // ---------- Notifications and users ----------
  async markRead(id) {
    const a = need()
    change({ notifications: db.notifications.map((n) => (n.id === id && n.userId === a.id ? { ...n, read: true } : n)) })
  },
  async markAllRead() {
    const a = need()
    change({ notifications: db.notifications.map((n) => (n.userId === a.id ? { ...n, read: true } : n)) })
  },
  async setUserRole(userId, role) {
    const a = need('*')
    if (!ROLE_LIST.includes(role)) throw new Error('Unknown role.')
    if (userId === a.id) throw new Error('You cannot change your own role. Ask another administrator.')
    change({ users: db.users.map((u) => (u.id === userId ? { ...u, role } : u)) })
    notify([userId], 'Your role is now ' + role + '.', 'dashboard')
    save()
  },
  async setUserActive(userId, active) {
    const a = need('*')
    if (userId === a.id) throw new Error('You cannot deactivate your own account.')
    change({ users: db.users.map((u) => (u.id === userId ? { ...u, active } : u)) })
  },

  // Only touches the demo storage key in this browser. It can never affect a real database.
  async resetDemo() {
    db = fresh()
    save()
  },
}
