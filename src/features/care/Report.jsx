import { useMemo, useState } from 'react'
import { Lightbulb, ShieldAlert } from 'lucide-react'
import CareTabs from './CareTabs.jsx'
import { useStore } from '../../app/StoreProvider.jsx'
import { findDuplicates } from '../../lib/issueInsights.js'
import { CATEGORIES } from '../../config/constants.js'
import { Page, Card, Field, Btn, PhotoInput, Badge } from '../../components/ui/index.jsx'

const empty = {
  title: '',
  category: CATEGORIES[0],
  location: '',
  priority: 'Medium',
  description: '',
  photo: null,
  safety: false,
}
export default function Report() {
  const { issues, addIssue, upvote } = useStore()
  const [f, setF] = useState(empty),
    [err, setErr] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const dups = useMemo(() => findDuplicates(issues, f), [issues, f.title, f.location, f.category])
  const submit = async (e) => {
    e.preventDefault()
    const x = {}
    if (f.title.trim().length < 5) x.title = 'Give a short title of at least 5 characters.'
    if (!f.location.trim()) x.location = 'Tell us where the problem is.'
    if (f.description.trim().length < 15) x.description = 'Add at least 15 characters so staff can act on it.'
    setErr(x)
    if (Object.keys(x).length) return
    const ok = await addIssue({
      ...f,
      title: f.title.trim(),
      location: f.location.trim(),
      description: f.description.trim(),
    })
    if (!ok) return
    setF(empty)
    location.hash = '/reports'
  }
  return (
    <Page title="Report an issue" sub="The more specific you are, the faster it gets fixed.">
      <CareTabs current="report" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:!translate-y-0">
          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="What's wrong?" error={err.title}>
              <input
                className="input"
                value={f.title}
                onChange={set('title')}
                placeholder="e.g. Projector flickers in Room 304"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select className="input" value={f.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select className="input" value={f.priority} onChange={set('priority')}>
                  {['Low', 'Medium', 'High'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Location" error={err.location}>
              <input
                className="input"
                value={f.location}
                onChange={set('location')}
                placeholder="Building, floor, room"
              />
            </Field>
            <Field label="Details" error={err.description}>
              <textarea
                rows={4}
                className="input"
                value={f.description}
                onChange={set('description')}
                placeholder="What happened, since when, who is affected?"
              />
            </Field>
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${f.safety ? 'border-rose-300 bg-rose-50' : 'border-navy-100'}`}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={f.safety} onChange={(e) => setF({ ...f, safety: e.target.checked })} />
              <span>
                <b className="flex items-center gap-1.5">
                  <ShieldAlert size={15} className="text-rose-600" aria-hidden="true" /> This is a safety concern
                </b>
                <span className="text-navy-500">Exposed wires, slip hazards, blocked exits. It is marked High priority and alerts administrators and Security straight away. For an emergency, call Campus Security.</span>
              </span>
            </label>
            <PhotoInput value={f.photo} onChange={(photo) => setF({ ...f, photo })} />
            <Btn type="submit">Submit report</Btn>
          </form>
        </Card>
        <div>
          {dups.length > 0 ? (
            <Card className="pop border-amber-200 bg-amber-50 hover:!translate-y-0">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Lightbulb size={18} className="text-amber-600" />
                Already reported?
              </h2>
              <p className="mt-1 text-sm text-navy-700">
                These open reports look similar. If one matches, add your voice instead of filing a duplicate.
              </p>
              <ul className="mt-3 space-y-3">
                {dups.map((d) => (
                  <li key={d.id} className="rounded-lg bg-white p-3 text-sm">
                    <p className="font-medium">{d.title}</p>
                    <p className="text-xs text-navy-500">
                      {d.location} · {d.affected} affected
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge s={d.status} />
                      <button
                        onClick={() => upvote(d.id)}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        I'm affected too
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card className="hover:!translate-y-0">
              <h2 className="font-display text-lg font-semibold">Duplicate check</h2>
              <p className="mt-1 text-sm text-navy-500">
                As you type a title and location, matching open reports show up here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Page>
  )
}
