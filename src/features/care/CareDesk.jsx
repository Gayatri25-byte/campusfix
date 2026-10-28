import { useState } from 'react'
import { Repeat } from 'lucide-react'
import CareTabs from './CareTabs.jsx'
import { useStore } from '../../app/StoreProvider.jsx'
import { recurring } from '../../lib/issueInsights.js'
import { STAFF, STATUSES } from '../../config/constants.js'
import { Page, Card, Badge, Btn, Field, PhotoInput, CountUp, DemoTag } from '../../components/ui/index.jsx'

export default function CareDesk() {
  const { issues, assign, advance, resolve, me } = useStore()
  const [res, setRes] = useState(null),
    [note, setNote] = useState(''),
    [photo, setPhoto] = useState(null),
    [err, setErr] = useState(''),
    [f, setF] = useState('Open'),
    [mineOnly, setMineOnly] = useState(me.role === 'staff')
  const open = issues.filter((i) => !['Resolved', 'Verified'].includes(i.status))
  const rows = issues
    .filter((i) => !mineOnly || !me.team || i.assignee === me.team || !i.assignee)
    .filter((i) => f === 'All' || (f === 'Open' ? open.includes(i) : i.status === f))
    .sort((a, b) => Number(b.safety) - Number(a.safety) || ({ High: 0, Medium: 1, Low: 2 })[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority])
  const stats = [
    ['Open', open.length],
    ['Unassigned', issues.filter((i) => !i.assignee).length],
    ['High priority', open.filter((i) => i.priority === 'High').length],
    ['Awaiting student', issues.filter((i) => i.status === 'Resolved').length],
  ]
  const submit = async () => {
    if (note.trim().length < 5) return setErr('Describe what was fixed (5+ characters).')
    if (!(await resolve(res, note.trim(), photo))) return
    setRes(null)
    setNote('')
    setPhoto(null)
    setErr('')
  }
  return (
    <Page title="Care desk" sub="Assign, update, and resolve campus issues. Safety reports float to the top.">
      <CareTabs current="care-desk" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <Card key={l}>
            <p className="font-display text-4xl font-semibold">
              <CountUp to={v} />
            </p>
            <p className="text-sm text-navy-500">{l}</p>
          </Card>
        ))}
      </div>
      {recurring(issues).length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Repeat size={18} />
            Recurring issue insights
          </h2>
          <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            {recurring(issues).map((r) => (
              <li key={r.category + r.location}>
                <b>
                  {r.count}× {r.category}
                </b>{' '}
                at {r.location}. Schedule a root-cause inspection.
              </li>
            ))}
          </ul>
        </div>
      )}
      {me.team && (
        <label className="mt-6 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="accent-teal-600" />
          Show only my team’s queue ({me.team}) and unassigned reports
        </label>
      )}
      <div className="my-6 flex flex-wrap gap-2">
        {['Open', 'All', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setF(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${f === s ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-teal-50'}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((i) => (
          <Card key={i.id} className="hover:!translate-y-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  {i.title} {i.safety && <Badge s="Safety" />} {i.demo && <DemoTag />}
                </p>
                <p className="text-xs text-navy-500">
                  {i.id} · {i.location} · {i.affected} affected
                </p>
              </div>
              <div className="flex gap-2">
                <Badge s={i.priority} />
                <Badge s={i.status} />
              </div>
            </div>
            {['Resolved', 'Verified'].includes(i.status) ? (
              <p className="mt-3 text-sm text-navy-500">
                {i.status === 'Resolved'
                  ? 'Waiting for the student to verify the fix.'
                  : 'Closed and verified by the student.'}
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  aria-label="Assign to"
                  className="input !w-auto"
                  value={i.assignee || ''}
                  onChange={(e) => e.target.value && assign(i.id, e.target.value)}
                >
                  <option value="">Assign to…</option>
                  {STAFF.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {i.assignee && i.status !== 'In Progress' && (
                  <Btn variant="ghost" onClick={() => advance(i.id, 'In Progress')}>
                    Start work
                  </Btn>
                )}
                <Btn
                  variant="dark"
                  onClick={() => {
                    setRes(i.id)
                    setErr('')
                  }}
                >
                  Resolve with proof
                </Btn>
              </div>
            )}
            {res === i.id && (
              <div className="pop mt-4 space-y-3 rounded-xl bg-navy-50 p-4">
                <Field label="What was fixed?" error={err}>
                  <textarea
                    rows={2}
                    className="input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
                <PhotoInput label="Proof photo (optional)" value={photo} onChange={setPhoto} />
                <div className="flex gap-2">
                  <Btn onClick={submit}>Mark resolved</Btn>
                  <Btn variant="ghost" onClick={() => setRes(null)}>
                    Cancel
                  </Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Page>
  )
}
