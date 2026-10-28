import { useState } from 'react'
import { useStore } from '../../app/StoreProvider.jsx'
import { ROLE_LIST, ROLE_LABEL } from '../../config/roles.js'
import { Page, Card, Tabs, Avatar, DemoTag, Badge, EmptyState } from '../../components/ui/index.jsx'
import { EventApprovals, EventForm, EventManager } from '../events/EventTools.jsx'
import { AnnounceForm, AcademicForm } from '../workspace/Forms.jsx'

function Users() {
  const { users, me, setUserRole, setUserActive } = useStore()
  return (
    <Card className="!p-0 hover:!translate-y-0">
      <p className="border-b border-navy-100 p-4 text-sm text-navy-500">Demo Mode: roles are stored in this browser. In the real backend, role changes are made by administrators in the database and enforced by Row Level Security.</p>
      <ul className="divide-y divide-navy-100">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <Avatar name={u.name} />
            <div className="min-w-0 flex-1"><p className="font-medium">{u.name} {u.demo && <DemoTag />} {!u.active && <Badge s="rejected" />}</p><p className="text-xs text-navy-500">{u.dept || u.team || u.club || '—'}</p></div>
            <select aria-label={`Role for ${u.name}`} className="input !w-auto" value={u.role} disabled={u.id === me.id} onChange={(e) => setUserRole(u.id, e.target.value)}>{ROLE_LIST.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
            <button disabled={u.id === me.id} onClick={() => setUserActive(u.id, !u.active)} className="text-sm font-semibold text-teal-700 disabled:opacity-40">{u.active ? 'Deactivate' : 'Reactivate'}</button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Admin() {
  const { events, items, claims, feedback } = useStore()
  const [tab, setTab] = useState('events')
  const pending = events.filter((e) => e.status === 'pending').length
  const disputes = items.filter((i) => i.status === 'disputed')
  return (
    <Page title="Administration" sub="Approvals, users and roles, disputes, announcements and moderation.">
      <Tabs label="Admin sections" value={tab} onChange={setTab} tabs={[['events', 'Event approvals', pending], ['users', 'Users & roles'], ['disputes', 'Lost & Found disputes', disputes.length], ['moderation', 'Moderation', feedback.filter((f) => f.hidden).length], ['post', 'Publish']]} />
      {tab === 'events' && (<div className="grid gap-6 lg:grid-cols-2"><div><h2 className="mb-3 text-xl font-semibold">Waiting for approval</h2><EventApprovals /><h2 className="mb-3 mt-8 text-xl font-semibold">All events</h2><EventManager /></div><EventForm /></div>)}
      {tab === 'users' && <Users />}
      {tab === 'disputes' && (disputes.length === 0 ? <EmptyState title="No disputes">When two people claim the same item, it appears here.</EmptyState> : (
        <ul className="space-y-3">{disputes.map((i) => <Card key={i.id} className="hover:!translate-y-0"><p className="font-semibold">{i.item}</p><p className="text-sm text-navy-500">{claims.filter((c) => c.itemId === i.id && c.status === 'pending').length} competing claims. Open <a className="font-semibold text-teal-700" href="#/lostfound">Lost & Found</a> to compare the private evidence and approve one.</p></Card>)}</ul>
      ))}
      {tab === 'moderation' && <p className="text-sm text-navy-700">Hide or unhide suggestions and set their status from <a className="font-semibold text-teal-700" href="#/community">Community → Suggestions</a>. Hidden posts ({feedback.filter((f) => f.hidden).length}) stay visible only to administrators.</p>}
      {tab === 'post' && (<div className="grid gap-6 lg:grid-cols-2"><AnnounceForm /><AcademicForm /></div>)}
    </Page>
  )
}
