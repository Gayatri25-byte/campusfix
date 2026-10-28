import { ClipboardList, Clock, CheckCircle2, CalendarCheck, Wrench, ShieldAlert, Users, PackageSearch, Inbox, AlertTriangle, Megaphone } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { ROLE_LABEL } from '../../config/roles.js'
import { Page, Card, CountUp, Reveal, Btn, Badge, ago, SectionHead } from '../../components/ui/index.jsx'
import { UpcomingEvents, AnnouncementsCard, ClassesToday, Deadlines, ActivityFeed } from './widgets.jsx'

const open = (i) => !['Resolved', 'Verified'].includes(i.status)

function Stats({ items }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(([I, l, v, href], i) => (
        <Reveal key={l} delay={i * 70}>
          <a href={href ? '#/' + href : undefined} className="block">
            <Card className={href ? '' : 'hover:!translate-y-0'}>
              <I className="text-teal-600" size={20} aria-hidden="true" />
              <p className="mt-3 font-display text-4xl font-semibold"><CountUp to={v} /></p>
              <p className="text-sm text-navy-500">{l}</p>
            </Card>
          </a>
        </Reveal>
      ))}
    </div>
  )
}

function MyIssues() {
  const { issues, me } = useStore()
  const list = issues.filter((i) => i.reporterId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  return (
    <Card className="hover:!translate-y-0">
      <SectionHead icon={Wrench} title="My recent reports" link="reports" />
      {list.length === 0 ? <p className="text-sm text-navy-500">You have not reported anything yet.</p> : (
        <ul className="divide-y divide-navy-100">
          {list.map((i) => (
            <li key={i.id}><a href="#/reports" className="flex items-center gap-3 py-2.5 hover:text-teal-700"><span className="min-w-0 flex-1 truncate text-sm font-medium">{i.title}</span><Badge s={i.status} /></a></li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function Student({ me, issues, regs }) {
  const mine = issues.filter((i) => i.reporterId === me.id)
  return (
    <>
      <Stats items={[
        [ClipboardList, 'My reports', mine.length, 'reports'],
        [Clock, 'Still open', mine.filter(open).length, 'reports'],
        [CheckCircle2, 'Awaiting my check', mine.filter((i) => i.status === 'Resolved').length, 'proof'],
        [CalendarCheck, 'Events I joined', regs.filter((r) => r.userId === me.id && r.status !== 'cancelled').length, 'events'],
      ]} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2"><ClassesToday /><Deadlines /></div>
          <UpcomingEvents />
          <MyIssues />
        </div>
        <div className="space-y-6"><AnnouncementsCard /><ActivityFeed /></div>
      </div>
    </>
  )
}

function Faculty({ me }) {
  const { academic, issues, events } = useStore()
  const posted = academic.filter((a) => a.authorId === me.id)
  return (
    <>
      <Stats items={[
        [Clock, 'Upcoming deadlines & exams', academic.filter((a) => a.dueAt && new Date(a.dueAt) > new Date()).length, 'academic'],
        [Megaphone, 'Notices I posted', posted.length, 'workspace'],
        [Wrench, 'My open reports', issues.filter((i) => i.reporterId === me.id && open(i)).length, 'reports'],
        [CalendarCheck, 'Upcoming events', events.filter((e) => e.status === 'approved' && new Date(e.startsAt) > new Date()).length, 'events'],
      ]} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2"><div className="grid gap-6 md:grid-cols-2"><ClassesToday forName={me.name} /><Deadlines /></div><UpcomingEvents /></div>
        <div className="space-y-6"><Card className="hover:!translate-y-0"><h2 className="text-xl font-semibold">Quick actions</h2><div className="mt-3 grid gap-2"><a href="#/workspace"><Btn className="w-full">Post a class update</Btn></a><a href="#/report"><Btn variant="ghost" className="w-full">Report a classroom issue</Btn></a></div></Card><AnnouncementsCard /></div>
      </div>
    </>
  )
}

function Staff({ me, issues, claims }) {
  const mine = issues.filter((i) => open(i) && (i.assignee === me.team))
  const unassigned = issues.filter((i) => !i.assignee)
  const queue = issues.filter((i) => open(i) && (i.assignee === me.team || !i.assignee)).sort((a, b) => Number(b.safety) - Number(a.safety) || a.priority.localeCompare(b.priority)).slice(0, 5)
  return (
    <>
      <Stats items={[
        [Wrench, 'In my team queue', mine.length, 'care-desk'],
        [Inbox, 'Unassigned', unassigned.length, 'care-desk'],
        [ShieldAlert, 'Safety reports open', issues.filter((i) => i.safety && open(i)).length, 'care-desk'],
        [PackageSearch, 'Claims to review', claims.filter((c) => c.status === 'pending').length, 'lostfound'],
      ]} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="hover:!translate-y-0 lg:col-span-2">
          <SectionHead icon={Wrench} title="Next up" link="care-desk" linkLabel="Open care desk" />
          <ul className="divide-y divide-navy-100">
            {queue.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{i.title} {i.safety && <Badge s="Safety" />}</p><p className="truncate text-xs text-navy-500">{i.location} · {ago(i.createdAt)}</p></div>
                <Badge s={i.priority} /><Badge s={i.status} />
              </li>
            ))}
            {queue.length === 0 && <li className="py-3 text-sm text-navy-500">Your queue is clear.</li>}
          </ul>
        </Card>
        <div className="space-y-6"><AnnouncementsCard /><ActivityFeed limit={4} /></div>
      </div>
    </>
  )
}

function Organizer({ me }) {
  const { events, regCounts, regs } = useStore()
  const mine = events.filter((e) => e.organizerId === me.id)
  const total = mine.reduce((n, e) => n + (regCounts[e.id]?.registered || 0), 0)
  return (
    <>
      <Stats items={[
        [CalendarCheck, 'My events', mine.length, 'workspace'],
        [Users, 'Confirmed registrations', total, 'workspace'],
        [Clock, 'Waiting for approval', mine.filter((e) => e.status === 'pending').length, 'workspace'],
        [CheckCircle2, 'Checked in', regs.filter((r) => r.checkedIn && mine.some((e) => e.id === r.eventId)).length, 'workspace'],
      ]} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="hover:!translate-y-0 lg:col-span-2">
          <SectionHead icon={CalendarCheck} title="My events" link="workspace" linkLabel="Manage" />
          <ul className="divide-y divide-navy-100">
            {mine.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="truncate font-medium">{e.title}</p><p className="text-xs text-navy-500">{regCounts[e.id]?.registered}/{e.capacity} seats · {regCounts[e.id]?.waitlist} waitlisted</p></div><Badge s={e.status} /></li>
            ))}
          </ul>
        </Card>
        <div className="space-y-6"><AnnouncementsCard /><ActivityFeed limit={4} /></div>
      </div>
    </>
  )
}

function Admin() {
  const { issues, events, items, feedback, users } = useStore()
  const pendingEvents = events.filter((e) => e.status === 'pending')
  return (
    <>
      <Stats items={[
        [CalendarCheck, 'Events to approve', pendingEvents.length, 'admin'],
        [AlertTriangle, 'Disputed items', items.filter((i) => i.status === 'disputed').length, 'lostfound'],
        [ShieldAlert, 'Open safety reports', issues.filter((i) => i.safety && open(i)).length, 'care-desk'],
        [Users, 'Active accounts', users.filter((u) => u.active).length, 'admin'],
      ]} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="hover:!translate-y-0">
            <SectionHead title="Needs your attention" />
            <ul className="space-y-2 text-sm">
              <li><a className="font-medium text-teal-700" href="#/admin">{pendingEvents.length} event proposal(s)</a> waiting for approval</li>
              <li><a className="font-medium text-teal-700" href="#/care-desk">{issues.filter((i) => !i.assignee).length} unassigned report(s)</a></li>
              <li><a className="font-medium text-teal-700" href="#/admin">{feedback.filter((f) => f.hidden).length} hidden suggestion(s)</a> in moderation</li>
              <li><a className="font-medium text-teal-700" href="#/analytics">Open analytics</a> for trends and recurring issues</li>
            </ul>
          </Card>
          <UpcomingEvents />
        </div>
        <div className="space-y-6"><AnnouncementsCard /><ActivityFeed limit={5} /></div>
      </div>
    </>
  )
}

export default function Dashboard() {
  const s = useStore()
  const { me } = s
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const body = { student: <Student {...s} />, faculty: <Faculty me={me} />, staff: <Staff {...s} />, organizer: <Organizer me={me} />, admin: <Admin /> }[me.role]
  return (
    <Page
      title={`${greet}, ${me.name.replace(/^(Dr|Prof|Ms|Mr)\.?\s+/, '').split(' ')[0]}`}
      sub={`${ROLE_LABEL[me.role]}${me.dept ? ' · ' + me.dept : me.team ? ' · ' + me.team : me.club ? ' · ' + me.club : ''}. Here is what matters today.`}
      action={me.role !== 'admin' && <a href="#/report"><Btn>Report an issue</Btn></a>}
    >
      {body}
    </Page>
  )
}
