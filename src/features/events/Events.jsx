import { useState } from 'react'
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { EVENT_TYPES } from '../../config/constants.js'
import { Page, Card, Btn, Badge, Tabs, EmptyState, dateTime, DemoTag } from '../../components/ui/index.jsx'

function EventCard({ e }) {
  const { me, regs, regCounts, registerEvent, cancelRegistration, can } = useStore()
  const c = regCounts[e.id] || { registered: 0, waitlist: 0 }
  const mine = regs.find((r) => r.eventId === e.id && r.userId === me?.id && r.status !== 'cancelled')
  const full = c.registered >= e.capacity
  const left = Math.max(0, e.capacity - c.registered)
  const past = new Date(e.startsAt) < new Date()
  const pct = Math.min(100, (c.registered / e.capacity) * 100)
  return (
    <Card className="flex flex-col hover:!translate-y-0">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-semibold text-mint-600">{e.type}</span>
        {e.status !== 'approved' && <Badge s={e.status} />}
        {mine && <Badge s={mine.status} />}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">{e.title} {e.demo && <DemoTag />}</h3>
      <p className="mt-1 text-sm text-navy-500">{e.description}</p>
      <ul className="mt-3 space-y-1 text-sm text-navy-700">
        <li className="flex items-center gap-2"><Clock size={14} className="text-teal-600" aria-hidden="true" />{dateTime(e.startsAt)}</li>
        <li className="flex items-center gap-2"><MapPin size={14} className="text-teal-600" aria-hidden="true" />{e.location} · {e.club}</li>
        <li className="flex items-center gap-2"><Users size={14} className="text-teal-600" aria-hidden="true" />{full ? 'Full' : left + ' of ' + e.capacity + ' seats left'}{c.waitlist > 0 && ' · ' + c.waitlist + ' waitlisted'}</li>
      </ul>
      <div className="mt-3 h-1.5 rounded-full bg-navy-100" role="img" aria-label={`${Math.round(pct)}% of seats taken`}>
        <div className={`h-1.5 rounded-full transition-all duration-700 ${full ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: pct + '%' }} />
      </div>
      <div className="mt-4 flex-1" />
      {e.status === 'approved' && !past && (
        !me ? <a href="#/signin"><Btn variant="ghost" className="w-full">Sign in to register</Btn></a>
        : mine ? <Btn variant="ghost" className="w-full" onClick={() => cancelRegistration(e.id)}>{mine.status === 'waitlist' ? 'Leave waitlist' : 'Cancel registration'}</Btn>
        : can('register') ? <Btn className="w-full" onClick={() => registerEvent(e.id)}>{full ? 'Join waitlist' : 'Register'}</Btn> : null
      )}
      {past && <p className="text-sm text-navy-500">This event has ended.</p>}
      {mine?.checkedIn && <p className="mt-2 text-sm font-semibold text-emerald-700">Checked in ✓</p>}
    </Card>
  )
}

export default function Events() {
  const { events, regs, me } = useStore()
  const [type, setType] = useState('All')
  const [tab, setTab] = useState('all')
  const now = new Date()
  const myIds = new Set(regs.filter((r) => r.userId === me?.id && r.status !== 'cancelled').map((r) => r.eventId))
  const list = events
    .filter((e) => e.status === 'approved' && new Date(e.startsAt) > now)
    .filter((e) => type === 'All' || e.type === type)
    .filter((e) => tab === 'all' || myIds.has(e.id))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  return (
    <Page title="Campus events" sub="Workshops, hackathons, bootcamps, club activities and cultural nights. Seats are limited; a waitlist opens when an event is full.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {me && <Tabs label="Event view" value={tab} onChange={setTab} tabs={[['all', 'All upcoming'], ['mine', 'My registrations', myIds.size]]} />}
        <label className="mb-6 ml-auto flex items-center gap-2 text-sm">
          <span className="text-navy-500">Type</span>
          <select className="input !w-auto" value={type} onChange={(e) => setType(e.target.value)}>
            <option>All</option>
            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No events match">Try another type, or check back soon.</EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      )}
      {me && (me.role === 'organizer' || me.role === 'faculty' || me.role === 'admin') && (
        <p className="mt-8 text-sm text-navy-500">Want to host one? Propose it in your <a className="font-semibold text-teal-700" href={me.role === 'admin' ? '#/admin' : '#/workspace'}>{me.role === 'admin' ? 'admin area' : 'workspace'}</a>.</p>
      )}
    </Page>
  )
}
