import { useState } from 'react'
import { ThumbsUp, Pin, Eye, EyeOff } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES } from '../../config/constants.js'
import { Page, Card, Btn, Field, Tabs, Badge, DemoTag, EmptyState, ago } from '../../components/ui/index.jsx'
import { AnnounceForm } from '../workspace/Forms.jsx'

function Announcements() {
  const { announcements, users, can } = useStore()
  const list = announcements.slice().sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at))
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {list.map((a) => (
          <Card key={a.id} className="hover:!translate-y-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{a.pinned && <Pin size={14} className="mr-1 inline text-teal-600" aria-label="Pinned" />}{a.title} {a.demo && <DemoTag />}</h2>
              {a.audience !== 'all' && <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold capitalize">For {a.audience}</span>}
            </div>
            <p className="mt-1 text-sm text-navy-700">{a.body}</p>
            <p className="mt-2 text-xs text-navy-500">{users.find((u) => u.id === a.authorId)?.name} · {ago(a.at)}</p>
          </Card>
        ))}
      </div>
      {can('post_notice') && <AnnounceForm />}
    </div>
  )
}

function Feedback() {
  const { feedback, addFeedback, voteFeedback, moderateFeedback, role } = useStore()
  const [f, setF] = useState({ title: '', body: '', category: FEEDBACK_CATEGORIES[0], anonymous: false })
  const [cat, setCat] = useState('All')
  const mod = role === 'admin'
  const list = feedback.filter((x) => cat === 'All' || x.category === cat).sort((a, b) => b.votes - a.votes || b.at.localeCompare(a.at))
  const submit = async (e) => {
    e.preventDefault()
    if (await addFeedback(f)) setF({ ...f, title: '', body: '' })
  }
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <label className="mb-4 flex items-center gap-2 text-sm"><span className="text-navy-500">Category</span>
          <select className="input !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option>All</option>{FEEDBACK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <div className="space-y-3">
          {list.length === 0 && <EmptyState title="No suggestions here yet">Be the first to post one.</EmptyState>}
          {list.map((x) => (
            <Card key={x.id} className={`flex gap-4 !p-4 hover:!translate-y-0 ${x.hidden ? 'border-rose-200 bg-rose-50/60' : ''}`}>
              <button onClick={() => voteFeedback(x.id)} aria-pressed={x.voted} aria-label={`${x.voted ? 'Remove vote from' : 'Vote for'} ${x.title}, ${x.votes} votes`}
                className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border text-sm font-semibold transition active:scale-95 ${x.voted ? 'border-teal-500 bg-teal-500 text-navy-950' : 'border-navy-200 bg-white hover:border-teal-500'}`}>
                <ThumbsUp size={16} aria-hidden="true" />{x.votes}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{x.title}</p><Badge s={x.status} />{x.hidden && <span className="text-xs font-semibold text-rose-700">Hidden from students</span>}{x.demo && <DemoTag />}</div>
                <p className="mt-1 text-sm text-navy-700">{x.body}</p>
                <p className="mt-1 text-xs text-navy-500">{x.category} · {x.author} · {ago(x.at)}</p>
                {mod && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select aria-label="Status" className="input !w-auto !py-1.5" value={x.status} onChange={(e) => moderateFeedback(x.id, { status: e.target.value })}>{FEEDBACK_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                    <Btn variant="ghost" className="!px-3 !py-1.5 !text-xs" onClick={() => moderateFeedback(x.id, { hidden: !x.hidden })}>{x.hidden ? <><Eye size={13} />Unhide</> : <><EyeOff size={13} />Hide</>}</Btn>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Card className="h-fit hover:!translate-y-0">
        <h2 className="text-xl font-semibold">Share a suggestion</h2>
        <form onSubmit={submit} noValidate className="mt-4 space-y-3">
          <Field label="Title"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Category"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{FEEDBACK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Details"><textarea rows={3} className="input" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal-600" checked={f.anonymous} onChange={(e) => setF({ ...f, anonymous: e.target.checked })} />Post anonymously (moderators can still see who posted)</label>
          <Btn type="submit" className="w-full">Post suggestion</Btn>
        </form>
      </Card>
    </div>
  )
}

export default function Community() {
  const [tab, setTab] = useState('announcements')
  return (
    <Page title="Community" sub="Announcements from across campus, and a voice for every student.">
      <Tabs label="Community views" value={tab} onChange={setTab} tabs={[['announcements', 'Announcements'], ['feedback', 'Suggestions & voting']]} />
      {tab === 'announcements' ? <Announcements /> : <Feedback />}
    </Page>
  )
}
