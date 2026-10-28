import { CalendarDays, Megaphone, Clock, Activity, Wrench, PackageSearch, BookOpen } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { Card, SectionHead, EmptyState, ago, dateTime, dayOnly, until, Badge } from '../../components/ui/index.jsx'
import { DAYS } from '../../config/constants.js'

export const todayAbbr = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
export const nextWeekday = () => (DAYS.includes(todayAbbr()) ? todayAbbr() : 'Mon')

export function UpcomingEvents({ limit = 3, mineOnly = false }) {
  const { events, regs, regCounts } = useStore()
  const list = events
    .filter((e) => e.status === 'approved' && new Date(e.startsAt) > new Date())
    .filter((e) => !mineOnly || regs.some((r) => r.eventId === e.id && r.status !== 'cancelled'))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, limit)
  return (
    <Card className="hover:!translate-y-0">
      <SectionHead icon={CalendarDays} title={mineOnly ? 'My events' : 'Upcoming events'} link="events" />
      {list.length === 0 ? (
        <EmptyState title="Nothing scheduled">{mineOnly ? 'Register for an event to see it here.' : 'New events will appear here.'}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {list.map((e) => {
            const mine = regs.find((r) => r.eventId === e.id && r.status !== 'cancelled')
            return (
              <li key={e.id} className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-50 text-center leading-tight text-mint-600">
                  <span className="text-[10px] font-semibold uppercase">{new Date(e.startsAt).toLocaleString(undefined, { month: 'short' })}</span>
                  <span className="font-display text-lg font-semibold">{new Date(e.startsAt).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <a href="#/events" className="block truncate font-medium hover:text-teal-700">{e.title}</a>
                  <p className="truncate text-xs text-navy-500">{e.location} · {regCounts[e.id]?.registered ?? 0}/{e.capacity} seats</p>
                </div>
                {mine && <Badge s={mine.status} />}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export function AnnouncementsCard({ limit = 3 }) {
  const { announcements } = useStore()
  const list = announcements.slice().sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at)).slice(0, limit)
  return (
    <Card className="hover:!translate-y-0">
      <SectionHead icon={Megaphone} title="Campus updates" link="community" />
      <ul className="space-y-3">
        {list.map((a) => (
          <li key={a.id} className="rounded-xl bg-sand-100 p-3">
            <p className="text-sm font-semibold">{a.pinned && <span className="mr-1 text-teal-700">Pinned ·</span>}{a.title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-navy-500">{a.body}</p>
            <p className="mt-1 text-[11px] text-navy-500">{ago(a.at)}{a.audience !== 'all' ? ' · for ' + a.audience : ''}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function ClassesToday({ forName }) {
  const { schedule, me } = useStore()
  const day = nextWeekday()
  const who = forName || null
  const list = schedule.filter((s) => s.day === day && (!who || s.who === who)).sort((a, b) => a.start.localeCompare(b.start))
  return (
    <Card className="hover:!translate-y-0">
      <SectionHead icon={Clock} title={(day === todayAbbr() ? 'Today' : 'Next: ' + day) + ' · timetable'} link="academic" />
      {list.length === 0 ? (
        <EmptyState title="No classes">{me?.role === 'student' ? 'Enjoy the free day.' : 'No teaching slots in your timetable.'}</EmptyState>
      ) : (
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.start + s.course} className="flex items-center gap-3 rounded-xl border border-navy-100 p-3">
              <span className="font-display text-sm font-semibold text-teal-700">{s.start}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.course}</p>
                <p className="truncate text-xs text-navy-500">{s.room} · {s.who}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function Deadlines({ limit = 4 }) {
  const { academic } = useStore()
  const list = academic.filter((a) => a.dueAt && new Date(a.dueAt) > new Date() && (a.kind === 'exam' || a.kind === 'deadline')).sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, limit)
  return (
    <Card className="hover:!translate-y-0">
      <SectionHead icon={BookOpen} title="Exams & deadlines" link="academic" />
      {list.length === 0 ? <p className="text-sm text-navy-500">No upcoming deadlines.</p> : (
        <ul className="space-y-2.5">
          {list.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
              <span><b className="font-medium">{a.title}</b><br /><span className="text-xs text-navy-500">{a.course} · {dayOnly(a.dueAt)}</span></span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${a.kind === 'exam' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>{until(a.dueAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// A feed built from what actually happened in the stored data (issue steps, announcements, new events).
export function ActivityFeed({ limit = 6 }) {
  const { issues, announcements, events, items } = useStore()
  const rows = [
    ...issues.flatMap((i) => i.timeline.slice(-1).map((t) => ({ id: i.id + t.at, at: t.at, icon: Wrench, text: i.id + ' ' + i.title + ' → ' + t.status, link: 'reports' }))),
    ...announcements.map((a) => ({ id: a.id, at: a.at, icon: Megaphone, text: 'Announcement: ' + a.title, link: 'community' })),
    ...events.filter((e) => e.status === 'approved').map((e) => ({ id: e.id, at: e.startsAt > new Date().toISOString() ? new Date(new Date(e.startsAt) - 7 * 864e5).toISOString() : e.startsAt, icon: CalendarDays, text: 'Event: ' + e.title, link: 'events' })),
    ...items.map((x) => ({ id: x.id, at: x.date, icon: PackageSearch, text: (x.type === 'found' ? 'Found: ' : 'Lost: ') + x.item, link: 'lostfound' })),
  ]
    .filter((r) => new Date(r.at) <= new Date())
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit)
  return (
    <Card className="hover:!translate-y-0">
      <SectionHead icon={Activity} title="Campus activity" />
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.id} className="rise flex items-start gap-3" style={{ animationDelay: i * 50 + 'ms' }}>
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-600"><r.icon size={14} aria-hidden="true" /></span>
            <a href={'#/' + r.link} className="min-w-0 flex-1 text-sm hover:text-teal-700">
              <span className="block truncate">{r.text}</span>
              <span className="text-xs text-navy-500">{ago(r.at)}</span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
}
