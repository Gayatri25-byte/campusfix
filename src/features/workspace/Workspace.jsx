import { Wrench, PackageSearch } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { Page, Card, Btn, Badge, ago, dayOnly } from '../../components/ui/index.jsx'
import { AcademicForm, AnnounceForm } from './Forms.jsx'
import { EventForm, EventManager } from '../events/EventTools.jsx'
import { ClassesToday } from '../home/widgets.jsx'

function Faculty() {
  const { academic, me } = useStore()
  const mine = academic.filter((a) => a.authorId === me.id).sort((a, b) => b.at.localeCompare(a.at))
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ClassesToday forName={me.name} />
        <Card className="hover:!translate-y-0"><h2 className="text-xl font-semibold">What I have posted</h2>
          <ul className="mt-3 divide-y divide-navy-100">{mine.length === 0 && <li className="py-2 text-sm text-navy-500">Nothing yet.</li>}
            {mine.map((a) => <li key={a.id} className="py-2.5 text-sm"><b>{a.title}</b> <span className="text-navy-500">· {a.course} · {a.dueAt ? dayOnly(a.dueAt) : ago(a.at)}</span></li>)}</ul></Card>
        <AnnounceForm />
      </div>
      <AcademicForm />
    </div>
  )
}

function Staff() {
  const { issues, me, claims } = useStore()
  const queue = issues.filter((i) => !['Resolved', 'Verified'].includes(i.status) && (i.assignee === me.team || !i.assignee))
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="hover:!translate-y-0"><h2 className="flex items-center gap-2 text-xl font-semibold"><Wrench size={18} className="text-teal-600" aria-hidden="true" />Repair queue ({me.team})</h2>
          <ul className="mt-3 divide-y divide-navy-100">{queue.map((i) => <li key={i.id} className="flex items-center gap-3 py-2.5 text-sm"><span className="min-w-0 flex-1 truncate">{i.title} {i.safety && <Badge s="Safety" />}</span><Badge s={i.status} /></li>)}</ul>
          <a href="#/care-desk" className="mt-3 inline-block"><Btn>Open care desk</Btn></a></Card>
        <Card className="hover:!translate-y-0"><h2 className="flex items-center gap-2 text-xl font-semibold"><PackageSearch size={18} className="text-teal-600" aria-hidden="true" />Found-item desk</h2>
          <p className="mt-2 text-sm text-navy-700">{claims.filter((c) => c.status === 'pending').length} claim(s) waiting for review, {claims.filter((c) => c.status === 'approved').length} waiting for handover.</p>
          <a href="#/lostfound" className="mt-3 inline-block"><Btn variant="ghost">Review claims</Btn></a></Card>
      </div>
      <AnnounceForm />
    </div>
  )
}

export default function Workspace() {
  const { role } = useStore()
  const title = { faculty: 'Faculty workspace', staff: 'Facility staff workspace', organizer: 'Event organizer workspace' }[role]
  return (
    <Page title={title} sub={{ faculty: 'Teaching, notices and class updates.', staff: 'Your queue, found-item desk and facility notices.', organizer: 'Propose events, watch registrations and check people in.' }[role]}>
      {role === 'faculty' && <Faculty />}
      {role === 'staff' && <Staff />}
      {role === 'organizer' && (<div className="grid gap-6 lg:grid-cols-2"><EventForm /><div><h2 className="mb-3 text-xl font-semibold">My events</h2><EventManager /></div></div>)}
    </Page>
  )
}
