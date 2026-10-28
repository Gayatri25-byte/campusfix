import { beforeEach, describe, expect, it } from 'vitest'
import { localService as s } from '../src/services/local/index.js'

const as = async (id) => {
  s.setActor(id)
  return s.load()
}
const fail = async (p, msg) => {
  await expect(p).rejects.toThrow(msg)
}
beforeEach(async () => {
  s.setActor(null)
  await s.resetDemo()
})

describe('authentication and permissions (demo logic)', () => {
  it('signed-out visitors cannot write anything', async () => {
    await as(null)
    await fail(s.addIssue({ title: 'abcdef', category: 'x', location: 'y', description: 'z' }), 'sign in')
    await fail(s.registerEvent('EV-1'), 'sign in')
  })
  it('students cannot use staff or admin actions', async () => {
    await as('u-student')
    await fail(s.assignIssue('CF-1004', 'IT Support'), 'not allowed')
    await fail(s.resolveIssue('CF-1004', 'fixed it fully'), 'not allowed')
    await fail(s.reviewEvent('EV-6', true), 'not allowed')
    await fail(s.setUserRole('u-s2', 'admin'), 'not allowed')
    await fail(s.createEvent({ title: 'Party', startsAt: new Date(Date.now() + 1e9), capacity: 5 }), 'not allowed')
  })
  it('admin cannot change own role', async () => {
    await as('u-admin')
    await fail(s.setUserRole('u-admin', 'student'), 'own role')
    await s.setUserRole('u-s2', 'faculty')
    expect((await s.load()).users.find((u) => u.id === 'u-s2').role).toBe('faculty')
  })
})

describe('campus care', () => {
  it('runs the full loop: report -> assign -> resolve -> verify, with history and notifications', async () => {
    await as('u-student')
    const id = await s.addIssue({ title: 'Broken fan', category: 'Electrical', location: 'Hostel B', priority: 'Low', description: 'Fan makes a loud noise' })
    await as('u-admin')
    await s.assignIssue(id, 'Electrical Dept')
    await s.setIssueStatus(id, 'In Progress')
    await fail(s.resolveIssue(id, ''), 'Describe')
    await s.resolveIssue(id, 'Replaced the bearing')
    await as('u-s2')
    await fail(s.verifyIssue(id, true), 'Only the person who reported')
    let d = await as('u-student')
    expect(d.notifications.some((n) => n.text.includes('verify'))).toBe(true)
    await s.verifyIssue(id, true)
    d = await s.load()
    const issue = d.issues.find((i) => i.id === id)
    expect(issue.status).toBe('Verified')
    expect(issue.timeline.map((t) => t.status)).toEqual(['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Verified'])
  })
  it('safety flag forces High priority and alerts admins', async () => {
    await as('u-student')
    const id = await s.addIssue({ title: 'Exposed wires', category: 'Safety', location: 'Block A', priority: 'Low', description: 'Wires hanging near stairs', safety: true })
    expect((await s.load()).issues.find((i) => i.id === id).priority).toBe('High')
    const d = await as('u-admin')
    expect(d.notifications.some((n) => n.text.includes('SAFETY'))).toBe(true)
  })
  it('stops repeated "affected" clicks', async () => {
    await as('u-student')
    await s.upvoteIssue('CF-1002')
    await fail(s.upvoteIssue('CF-1002'), 'already')
  })
  it('reopening clears proof and returns to In Progress', async () => {
    await as('u-student')
    await s.verifyIssue('CF-1006', false, 'still flickers')
    const i = (await s.load()).issues.find((x) => x.id === 'CF-1006')
    expect(i.status).toBe('In Progress')
    expect(i.proof).toBeNull()
  })
})

describe('lost & found privacy and handover', () => {
  it('hides private evidence and contact from other students', async () => {
    let d = await as('u-student')
    const item = d.items.find((x) => x.id === 'LF-2')
    expect(item.privateDetail).toBeUndefined()
    expect(item.contact).toBeUndefined()
    expect(d.claims.find((c) => c.itemId === 'LF-2')).toBeUndefined() // someone else's claim
    d = await as('u-staff')
    expect(d.items.find((x) => x.id === 'LF-2').privateDetail).toMatch(/R\.K\./)
  })
  it('requires evidence, then approval, code, and matching handover', async () => {
    await as('u-student')
    await fail(s.submitClaim('LF-3', 'short'), '15+')
    await s.submitClaim('LF-3', 'My name is Sam and the card has a blue lanyard clip')
    await fail(s.submitClaim('LF-3', 'My name is Sam and the card has a blue lanyard clip'), 'already')
    await as('u-s2')
    await fail(s.reviewClaim('CL-1', 'approve'), 'cannot review')
    let d = await as('u-staff')
    const claim = d.claims.find((c) => c.itemId === 'LF-3')
    await s.reviewClaim(claim.id, 'approve')
    d = await as('u-staff')
    expect(d.claims.find((c) => c.id === claim.id).pickupCode).toBeUndefined() // staff never see the code
    d = await as('u-student')
    const code = d.claims.find((c) => c.itemId === 'LF-3').pickupCode
    expect(code).toMatch(/^\d{4}$/)
    await as('u-staff')
    await fail(s.confirmHandover(claim.id, '0000x'), 'does not match')
    await s.confirmHandover(claim.id, code)
    expect((await s.load()).items.find((x) => x.id === 'LF-3').status).toBe('returned')
  })
  it('competing claims become disputed and only admin can settle', async () => {
    await as('u-student')
    await s.submitClaim('LF-2', 'It has initials R.K. on the back and a cracked cover')
    let d = await s.load()
    expect(d.items.find((x) => x.id === 'LF-2').status).toBe('disputed')
    d = await as('u-staff')
    await fail(s.reviewClaim(d.claims.find((c) => c.id === 'CL-1').id, 'approve'), 'administrator')
    await as('u-admin')
    await s.reviewClaim('CL-1', 'approve')
    d = await s.load()
    expect(d.items.find((x) => x.id === 'LF-2').status).toBe('ready_for_pickup')
    expect(d.claims.filter((c) => c.itemId === 'LF-2' && c.status === 'rejected')).toHaveLength(1)
  })
  it('a found post must carry a private detail', async () => {
    await as('u-student')
    await fail(s.addItem({ type: 'found', item: 'Umbrella', location: 'Gate' }), 'private detail')
  })
})

describe('events', () => {
  it('fills capacity, waitlists, and promotes on cancellation', async () => {
    await as('u-student')
    expect(await s.registerEvent('EV-3')).toBe('waitlist') // capacity 3 already full in seed
    await fail(s.registerEvent('EV-3'), 'already')
    await as('u-s2')
    await s.cancelRegistration('EV-3')
    const d = await as('u-student')
    expect(d.regs.find((r) => r.eventId === 'EV-3').status).toBe('registered')
    expect(d.notifications.some((n) => n.text.includes('seat opened'))).toBe(true)
  })
  it('organizer proposals need admin approval and are hidden until approved', async () => {
    await as('u-organizer')
    expect(await s.createEvent({ title: 'Chess meetup', type: 'Club activity', startsAt: new Date(Date.now() + 5e8).toISOString(), capacity: 10 })).toBe('pending')
    const id = (await s.load()).events.find((e) => e.title === 'Chess meetup').id
    await fail(s.registerEvent(id), 'not open')
    let d = await as('u-student')
    expect(d.events.some((e) => e.id === id)).toBe(false)
    await as('u-admin')
    await s.reviewEvent(id, true)
    d = await as('u-student')
    expect(d.events.some((e) => e.id === id)).toBe(true)
  })
  it('validates event input and check-in ownership', async () => {
    await as('u-organizer')
    await fail(s.createEvent({ title: 'x', startsAt: new Date(Date.now() + 1e9), capacity: 5 }), 'title')
    await fail(s.createEvent({ title: 'Valid title', startsAt: '2001-01-01', capacity: 5 }), 'future')
    await fail(s.createEvent({ title: 'Valid title', startsAt: new Date(Date.now() + 1e9), capacity: 0 }), 'Capacity')
    await s.checkIn('EV-1', 'u-s2')
    expect((await s.load()).regs.find((r) => r.id === 'R-1').checkedIn).toBe(true)
    await as('u-faculty')
    await fail(s.checkIn('EV-1', 'u-s2'), 'not allowed')
  })
})

describe('community', () => {
  it('audience-targeted announcements are only visible to that audience', async () => {
    let d = await as('u-student')
    expect(d.announcements.some((a) => a.audience === 'faculty')).toBe(false)
    d = await as('u-faculty')
    expect(d.announcements.some((a) => a.audience === 'faculty')).toBe(true)
  })
  it('feedback: one vote per user toggle, anonymous hidden from non-moderators, hidden posts moderated', async () => {
    let d = await as('u-student')
    expect(d.feedback.find((f) => f.id === 'FB-2').author).toBe('Anonymous')
    expect(d.feedback.some((f) => f.id === 'FB-4')).toBe(false)
    await s.voteFeedback('FB-2')
    expect((await s.load()).feedback.find((f) => f.id === 'FB-2').votes).toBe(2)
    await s.voteFeedback('FB-2')
    expect((await s.load()).feedback.find((f) => f.id === 'FB-2').votes).toBe(1)
    await fail(s.moderateFeedback('FB-2', { hidden: true }), 'not allowed')
    d = await as('u-admin')
    expect(d.feedback.some((f) => f.id === 'FB-4')).toBe(true)
    await s.moderateFeedback('FB-2', { hidden: true })
    d = await as('u-student')
    expect(d.feedback.some((f) => f.id === 'FB-2')).toBe(false)
  })
})
