import { useState } from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { DAYS, ACADEMIC_KINDS } from '../../config/constants.js'
import { Page, Card, Tabs, EmptyState, Badge, dayOnly, until, ago } from '../../components/ui/index.jsx'
import { todayAbbr } from '../home/widgets.jsx'

// SAMPLE resource list: no real links are included.
const RESOURCES = [
  ['Library e-resources', 'Journals, e-books and past papers (sample entry)'],
  ['Lab manuals', 'Physics, chemistry and computing lab handbooks (sample entry)'],
  ['Syllabus & credit rules', 'Department syllabus documents (sample entry)'],
  ['Exam rules', 'Conduct, hall tickets and re-evaluation process (sample entry)'],
]
const kindTone = { exam: 'bg-rose-100 text-rose-700', deadline: 'bg-amber-100 text-amber-800', class_update: 'bg-sky-100 text-sky-800', notice: 'bg-slate-100 text-slate-700' }

export default function Academic() {
  const { schedule, academic, me, users } = useStore()
  const [tab, setTab] = useState('timetable')
  const mySlots = me.role === 'faculty' ? schedule.filter((s) => s.who === me.name) : schedule
  const dated = academic.filter((a) => a.dueAt && (a.kind === 'exam' || a.kind === 'deadline')).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const notices = academic.filter((a) => a.kind === 'notice' || a.kind === 'class_update').sort((a, b) => b.at.localeCompare(a.at))
  const author = (id) => users.find((u) => u.id === id)?.name
  return (
    <Page title="Academic life" sub={me.role === 'student' ? 'Your week, deadlines, exam notices and room changes.' : 'Timetable, exam notices and academic updates.'}>
      <Tabs label="Academic views" value={tab} onChange={setTab} tabs={[['timetable', 'Timetable'], ['calendar', 'Calendar & deadlines', dated.length], ['updates', 'Notices & class updates'], ['resources', 'Resources']]} />
      {tab === 'timetable' && (
        <>
          <p className="mb-4 text-xs text-navy-500">Sample timetable for the demo. In a real deployment each student’s timetable comes from the college’s records.</p>
          <div className="grid gap-4 md:grid-cols-5">
            {DAYS.map((d) => (
              <section key={d} aria-label={d} className={`rounded-2xl border p-3 ${d === todayAbbr() ? 'border-teal-400 bg-teal-50/50' : 'border-navy-100 bg-white'}`}>
                <h2 className="mb-2 font-display text-lg font-semibold">{d}{d === todayAbbr() && <span className="ml-2 text-xs font-sans font-semibold text-teal-700">Today</span>}</h2>
                <ul className="space-y-2">
                  {mySlots.filter((s) => s.day === d).sort((a, b) => a.start.localeCompare(b.start)).map((s) => (
                    <li key={s.start + s.course} className="rounded-xl bg-sand-100 p-2.5 text-sm">
                      <p className="text-xs font-semibold text-teal-700">{s.start}–{s.end}</p>
                      <p className="font-medium leading-snug">{s.course}</p>
                      <p className="text-xs text-navy-500">{s.room}</p>
                    </li>
                  ))}
                  {mySlots.filter((s) => s.day === d).length === 0 && <li className="text-xs text-navy-500">Free</li>}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
      {tab === 'calendar' && (
        dated.length === 0 ? <EmptyState icon={BookOpen} title="Nothing scheduled" /> : (
          <ol className="space-y-3">
            {dated.map((a) => (
              <li key={a.id}>
                <Card className="flex flex-wrap items-center gap-4 !p-4 hover:!translate-y-0">
                  <div className="w-24 shrink-0"><p className="font-display text-lg font-semibold">{dayOnly(a.dueAt)}</p><p className="text-xs text-navy-500">{until(a.dueAt)}</p></div>
                  <div className="min-w-0 flex-1"><p className="font-medium">{a.title}</p><p className="text-sm text-navy-500">{a.detail}</p><p className="text-xs text-navy-500">{a.course}{author(a.authorId) ? ' · posted by ' + author(a.authorId) : ''}</p></div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${kindTone[a.kind]}`}>{ACADEMIC_KINDS[a.kind]}</span>
                </Card>
              </li>
            ))}
          </ol>
        )
      )}
      {tab === 'updates' && (
        <div className="space-y-3">
          {notices.length === 0 && <EmptyState title="No updates" />}
          {notices.map((a) => (
            <Card key={a.id} className="!p-4 hover:!translate-y-0">
              <div className="flex items-center justify-between gap-2"><p className="font-medium">{a.title}</p><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${kindTone[a.kind]}`}>{ACADEMIC_KINDS[a.kind]}</span></div>
              <p className="mt-1 text-sm text-navy-700">{a.detail}</p>
              <p className="mt-1 text-xs text-navy-500">{a.course && a.course + ' · '}{author(a.authorId)} · {ago(a.at)}</p>
            </Card>
          ))}
        </div>
      )}
      {tab === 'resources' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {RESOURCES.map(([t, d]) => (
            <Card key={t} className="hover:!translate-y-0"><h2 className="flex items-center gap-2 text-lg font-semibold"><ExternalLink size={16} className="text-teal-600" aria-hidden="true" />{t}</h2><p className="mt-1 text-sm text-navy-500">{d}</p></Card>
          ))}
        </div>
      )}
      {(me.role === 'faculty' || me.role === 'admin') && <p className="mt-8 text-sm text-navy-500">Post a notice, deadline or room change from your <a className="font-semibold text-teal-700" href={me.role === 'admin' ? '#/admin' : '#/workspace'}>{me.role === 'admin' ? 'admin area' : 'workspace'}</a>.</p>}
    </Page>
  )
}
