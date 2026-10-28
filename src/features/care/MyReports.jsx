import { useState } from 'react'
import { Search, ChevronDown, Users } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { STATUSES, CATEGORIES } from '../../config/constants.js'
import { Page, Card, Badge, DemoTag, Timeline, ago, Btn, EmptyState } from '../../components/ui/index.jsx'
import CareTabs from './CareTabs.jsx'

export default function MyReports() {
  const { issues, upvote, me } = useStore()
  const [q, setQ] = useState(''),
    [st, setSt] = useState('All'),
    [cat, setCat] = useState('All'),
    [open, setOpen] = useState(null),
    [scope, setScope] = useState('mine')
  const list = issues
    .filter(
      (i) =>
        (scope === 'all' || i.reporterId === me.id) &&
        (st === 'All' || i.status === st) &&
        (cat === 'All' || i.category === cat) &&
        (i.title + i.location + i.id).toLowerCase().includes(q.toLowerCase()),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <Page
      title="My reports"
      sub="Search, filter, and follow every issue from submission to verified fix."
      action={
        <a href="#/report">
          <Btn>New report</Btn>
        </a>
      }
    >
      <CareTabs current="reports" />
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-navy-500" />
          <input
            aria-label="Search reports"
            className="input !pl-9"
            placeholder="Search title, location, or ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select aria-label="Status" className="input" value={st} onChange={(e) => setSt(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select aria-label="Category" className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select aria-label="Scope" className="input" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="mine">My reports</option>
          <option value="all">All campus</option>
        </select>
      </div>
      {list.length === 0 && (
        <EmptyState title="No reports match" action={<a href="#/report"><Btn>File a new report</Btn></a>}>
          Clear a filter, or report a new problem.
        </EmptyState>
      )}
      <div className="space-y-3">
        {list.map((i) => (
          <Card key={i.id} className="!p-0 hover:!translate-y-0">
            <button
              onClick={() => setOpen(open === i.id ? null : i.id)}
              aria-expanded={open === i.id}
              className="flex w-full items-center gap-3 p-5 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {i.title} {i.safety && <Badge s="Safety" />} {i.demo && <DemoTag />}
                </p>
                <p className="mt-0.5 text-xs text-navy-500">
                  {i.id} · {i.category} · {i.location} · {ago(i.createdAt)}
                </p>
              </div>
              <Badge s={i.priority} />
              <Badge s={i.status} />
              <ChevronDown size={18} className={`transition ${open === i.id ? 'rotate-180' : ''}`} />
            </button>
            {open === i.id && (
              <div className="pop grid gap-6 border-t border-navy-100 p-5 md:grid-cols-2">
                <div>
                  <p className="text-sm text-navy-700">{i.description}</p>
                  {i.photo && (
                    <img src={i.photo} alt="Reported issue" className="mt-3 h-40 rounded-lg object-cover" />
                  )}
                  <p className="mt-3 text-xs text-navy-500">
                    Assigned to: <b>{i.assignee || 'Not yet assigned'}</b>
                  </p>
                  <button
                    onClick={() => upvote(i.id)}
                    disabled={i.affectedBy.includes(me.id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 disabled:cursor-default disabled:opacity-70 disabled:hover:bg-teal-50"
                  >
                    <Users size={13} />
                    {i.affected} affected{i.affectedBy.includes(me.id) ? '' : " · I'm affected too"}
                  </button>
                </div>
                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold">Tracking timeline</h3>
                  <Timeline items={i.timeline} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Page>
  )
}
