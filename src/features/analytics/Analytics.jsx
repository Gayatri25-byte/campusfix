import { useStore } from '../../app/StoreProvider.jsx'
import { recurring } from '../../lib/issueInsights.js'
import { CATEGORIES, STATUSES } from '../../config/constants.js'
import { Page, Card, CountUp, Reveal } from '../../components/ui/index.jsx'

export const hoursToResolve = (i) => {
  const a = i.timeline.find((t) => t.status === 'Submitted')
  const b = i.timeline.find((t) => t.status === 'Resolved')
  return a && b ? (new Date(b.at) - new Date(a.at)) / 36e5 : null
}

function Bars({ rows, tone = 'bg-teal-500' }) {
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <ul className="space-y-2.5">
      {rows.map(([l, n]) => (
        <li key={l}><div className="flex justify-between text-xs"><span>{l}</span><span className="text-navy-500">{n}</span></div>
          <div className="mt-1 h-2 rounded-full bg-navy-100"><div className={`h-2 rounded-full transition-all duration-700 ${tone}`} style={{ width: (n / max) * 100 + '%' }} /></div></li>
      ))}
    </ul>
  )
}

export default function Analytics() {
  const { issues, items, events, regCounts, feedback, users } = useStore()
  const times = issues.map(hoursToResolve).filter((h) => h !== null)
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
  const demoN = [...issues, ...items, ...events, ...feedback].filter((x) => x.demo).length
  const total = issues.length + items.length + events.length + feedback.length
  const seats = events.filter((e) => e.status === 'approved')
  const filled = seats.reduce((n, e) => n + (regCounts[e.id]?.registered || 0), 0)
  const cap = seats.reduce((n, e) => n + e.capacity, 0)
  const top = [
    [issues.length, 'Reports logged'],
    [avg, 'Avg hours to resolve'],
    [items.filter((i) => i.status === 'returned').length, 'Items returned'],
    [filled, 'Event seats booked'],
  ]
  return (
    <Page title="Analytics" sub="Computed live from the data stored in this browser. No numbers are invented.">
      <div role="note" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <b>Data basis:</b> {demoN} of {total} records are sample demo data; {total - demoN} were created during this session. Treat the trends as a demonstration of the dashboard, not real campus statistics.
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {top.map(([n, l], i) => (<Reveal key={l} delay={i * 60}><Card className="hover:!translate-y-0"><p className="font-display text-4xl font-semibold"><CountUp to={n} /></p><p className="text-sm text-navy-500">{l}</p></Card></Reveal>))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="hover:!translate-y-0"><h2 className="mb-3 text-xl font-semibold">Issues by status</h2><Bars rows={STATUSES.map((s) => [s, issues.filter((i) => i.status === s).length])} /></Card>
        <Card className="hover:!translate-y-0"><h2 className="mb-3 text-xl font-semibold">Issues by category</h2><Bars rows={CATEGORIES.map((c) => [c, issues.filter((i) => i.category === c).length]).filter((r) => r[1])} tone="bg-navy-500" /></Card>
        <Card className="hover:!translate-y-0"><h2 className="mb-3 text-xl font-semibold">Recurring problems</h2>
          {recurring(issues).length === 0 ? <p className="text-sm text-navy-500">None detected.</p> : <ul className="space-y-2 text-sm">{recurring(issues).map((r) => <li key={r.category + r.location} className="rounded-lg bg-amber-50 p-3"><b>{r.count}×</b> {r.category} at {r.location}</li>)}</ul>}</Card>
        <Card className="hover:!translate-y-0"><h2 className="mb-3 text-xl font-semibold">Event seat fill</h2>
          <p className="mb-3 text-sm text-navy-500">{filled} of {cap} seats booked across {seats.length} approved events.</p>
          <Bars rows={seats.map((e) => [e.title, regCounts[e.id]?.registered || 0])} tone="bg-mint-400" /></Card>
        <Card className="hover:!translate-y-0"><h2 className="mb-3 text-xl font-semibold">Most-voted suggestions</h2>
          <Bars rows={feedback.filter((f) => !f.hidden).sort((a, b) => b.votes - a.votes).slice(0, 5).map((f) => [f.title, f.votes])} tone="bg-sand-400" /></Card>
        <Card className="hover:!translate-y-0"><h2 className="mb-3 text-xl font-semibold">People</h2>
          <Bars rows={['student', 'faculty', 'staff', 'organizer', 'admin'].map((r) => [r, users.filter((u) => u.role === r && u.active).length])} tone="bg-navy-700" /></Card>
      </div>
    </Page>
  )
}
