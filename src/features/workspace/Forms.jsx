import { useState } from 'react'
import { useStore } from '../../app/StoreProvider.jsx'
import { ROLE_LIST, ROLE_LABEL } from '../../config/roles.js'
import { ACADEMIC_KINDS } from '../../config/constants.js'
import { Card, Btn, Field } from '../../components/ui/index.jsx'

export function AnnounceForm() {
  const { postAnnouncement, role } = useStore()
  const [f, setF] = useState({ title: '', body: '', audience: 'all', pinned: false })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (await postAnnouncement(f)) setF({ ...f, title: '', body: '' })
  }
  return (
    <Card className="h-fit hover:!translate-y-0">
      <h2 className="text-xl font-semibold">Post an announcement</h2>
      <form onSubmit={submit} noValidate className="mt-4 space-y-3">
        <Field label="Title"><input className="input" value={f.title} onChange={set('title')} /></Field>
        <Field label="Message"><textarea rows={3} className="input" value={f.body} onChange={set('body')} /></Field>
        <Field label="Audience"><select className="input" value={f.audience} onChange={set('audience')}><option value="all">Everyone</option>{ROLE_LIST.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}s only</option>)}</select></Field>
        {role === 'admin' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal-600" checked={f.pinned} onChange={(e) => setF({ ...f, pinned: e.target.checked })} />Pin to the top</label>}
        <Btn type="submit" className="w-full">Post</Btn>
      </form>
    </Card>
  )
}

export function AcademicForm() {
  const { postAcademic } = useStore()
  const [f, setF] = useState({ kind: 'class_update', title: '', detail: '', course: '', dueAt: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (await postAcademic(f)) setF({ ...f, title: '', detail: '', dueAt: '' })
  }
  const needsDate = f.kind === 'exam' || f.kind === 'deadline'
  return (
    <Card className="h-fit hover:!translate-y-0">
      <h2 className="text-xl font-semibold">Post an academic update</h2>
      <p className="text-sm text-navy-500">Students are notified straight away.</p>
      <form onSubmit={submit} noValidate className="mt-4 space-y-3">
        <Field label="Type"><select className="input" value={f.kind} onChange={set('kind')}>{Object.entries(ACADEMIC_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <Field label="Title"><input className="input" value={f.title} onChange={set('title')} placeholder="e.g. Lab moved to Room 210" /></Field>
        <Field label="Course (optional)"><input className="input" value={f.course} onChange={set('course')} placeholder="CS201" /></Field>
        {needsDate && <Field label="Date"><input type="datetime-local" className="input" value={f.dueAt} onChange={set('dueAt')} /></Field>}
        <Field label="Details"><textarea rows={3} className="input" value={f.detail} onChange={set('detail')} /></Field>
        <Btn type="submit" className="w-full">Post update</Btn>
      </form>
    </Card>
  )
}
