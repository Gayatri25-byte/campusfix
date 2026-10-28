import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { EVENT_TYPES } from '../../config/constants.js'
import { Card, Btn, Field, Badge, dateTime, EmptyState } from '../../components/ui/index.jsx'

const blank = { title: '', type: EVENT_TYPES[0], startsAt: '', location: '', capacity: 30, description: '', club: '' }

export function EventForm() {
  const { createEvent, role } = useStore()
  const [f, setF] = useState(blank)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (await createEvent(f)) setF(blank)
  }
  return (
    <Card className="hover:!translate-y-0">
      <h2 className="text-xl font-semibold">Propose an event</h2>
      <p className="text-sm text-navy-500">{role === 'admin' ? 'Administrator events publish immediately.' : 'An administrator approves it before it appears publicly.'}</p>
      <form onSubmit={submit} noValidate className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Title"><input className="input" value={f.title} onChange={set('title')} /></Field></div>
        <Field label="Type"><select className="input" value={f.type} onChange={set('type')}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Date and time"><input type="datetime-local" className="input" value={f.startsAt} onChange={set('startsAt')} /></Field>
        <Field label="Location"><input className="input" value={f.location} onChange={set('location')} /></Field>
        <Field label="Capacity"><input type="number" min="1" className="input" value={f.capacity} onChange={set('capacity')} /></Field>
        <div className="sm:col-span-2"><Field label="Description"><textarea rows={3} className="input" value={f.description} onChange={set('description')} /></Field></div>
        <div className="sm:col-span-2"><Btn type="submit">Submit event</Btn></div>
      </form>
    </Card>
  )
}

export function EventManager() {
  const { events, regs, regCounts, users, me, checkIn } = useStore()
  const mine = events.filter((e) => e.organizerId === me.id || me.role === 'admin')
  const name = (id) => users.find((u) => u.id === id)?.name || 'Someone'
  if (!mine.length) return <EmptyState title="No events yet">Propose your first event above.</EmptyState>
  return (
    <div className="space-y-4">
      {mine.map((e) => {
        const rows = regs.filter((r) => r.eventId === e.id && r.status !== 'cancelled').sort((a, b) => a.at.localeCompare(b.at))
        const c = regCounts[e.id]
        return (
          <Card key={e.id} className="hover:!translate-y-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="font-semibold">{e.title}</p><p className="text-xs text-navy-500">{dateTime(e.startsAt)} · {c.registered}/{e.capacity} confirmed · {c.waitlist} waitlisted</p></div>
              <Badge s={e.status} />
            </div>
            {e.status === 'approved' && (
              <ul className="mt-3 divide-y divide-navy-100 text-sm">
                {rows.length === 0 && <li className="py-2 text-navy-500">No registrations yet.</li>}
                {rows.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2">
                    <span className="min-w-0 flex-1 truncate">{name(r.userId)}</span>
                    <Badge s={r.status} />
                    {r.status === 'registered' && (
                      <Btn variant={r.checkedIn ? 'primary' : 'ghost'} className="!px-3 !py-1.5 !text-xs" aria-pressed={r.checkedIn} onClick={() => checkIn(e.id, r.userId)}>
                        {r.checkedIn ? <><Check size={13} />Checked in</> : 'Check in'}
                      </Btn>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export function EventApprovals() {
  const { events, users, reviewEvent } = useStore()
  const pending = events.filter((e) => e.status === 'pending')
  if (!pending.length) return <EmptyState title="No events waiting">Proposals from organizers appear here.</EmptyState>
  return (
    <div className="space-y-3">
      {pending.map((e) => (
        <Card key={e.id} className="hover:!translate-y-0">
          <p className="font-semibold">{e.title}</p>
          <p className="text-xs text-navy-500">{e.type} · {dateTime(e.startsAt)} · {e.location} · {e.capacity} seats · by {users.find((u) => u.id === e.organizerId)?.name}</p>
          <p className="mt-2 text-sm">{e.description}</p>
          <div className="mt-3 flex gap-2"><Btn onClick={() => reviewEvent(e.id, true)}><Check size={14} />Approve</Btn><Btn variant="ghost" onClick={() => reviewEvent(e.id, false)}><X size={14} />Decline</Btn></div>
        </Card>
      ))}
    </div>
  )
}
