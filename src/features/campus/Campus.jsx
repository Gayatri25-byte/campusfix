import { useState } from 'react'
import { Phone, Search, Clock, MapPin } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { BUILDINGS, DIRECTORY, buildingFor } from '../../config/campus.js'
import { Page, Card, Badge, EmptyState, dateTime } from '../../components/ui/index.jsx'
import CampusMap from '../../components/CampusMap.jsx'

export default function Campus() {
  const { issues, events, me } = useStore()
  const [sel, setSel] = useState('library')
  const [q, setQ] = useState('')
  const b = BUILDINGS.find((x) => x.id === sel)
  const openIssues = issues.filter((i) => !['Resolved', 'Verified'].includes(i.status))
  const pins = {}
  openIssues.forEach((i) => {
    const bl = buildingFor(i.location)
    if (bl) pins[bl.id] = (pins[bl.id] || 0) + 1
  })
  const here = openIssues.filter((i) => buildingFor(i.location)?.id === sel)
  const evHere = events.filter((e) => e.status === 'approved' && new Date(e.startsAt) > new Date() && buildingFor(e.location)?.id === sel)
  const dir = DIRECTORY.filter((d) => (d.name + d.detail + d.group).toLowerCase().includes(q.toLowerCase()))
  const groups = [...new Set(dir.map((d) => d.group))]
  return (
    <Page title="Campus map & directory" sub="An illustrative map: positions are invented for the demo. Select a building to see hours, contacts and what is happening there.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><CampusMap selected={sel} onSelect={setSel} pins={pins} /><p className="mt-2 text-xs text-navy-500">Red markers show open Campus Care issues{me ? '' : ' (sign in to see them)'}.</p></div>
        <Card className="hover:!translate-y-0" aria-live="polite">
          <h2 className="text-xl font-semibold">{b.name}</h2>
          <p className="mt-1 text-sm text-navy-700">{b.desc}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-navy-700">
            <li className="flex items-center gap-2"><Clock size={14} className="text-teal-600" aria-hidden="true" />{b.hours}</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-teal-600" aria-hidden="true" />{b.ext} (sample)</li>
          </ul>
          <h3 className="mt-4 text-sm font-semibold">Upcoming here</h3>
          {evHere.length ? evHere.map((e) => <p key={e.id} className="text-sm text-navy-700">{e.title} · {dateTime(e.startsAt)}</p>) : <p className="text-sm text-navy-500">No events scheduled.</p>}
          {me && (<><h3 className="mt-4 text-sm font-semibold">Open issues here</h3>
          {here.length ? here.map((i) => <p key={i.id} className="flex items-center justify-between gap-2 text-sm"><span className="truncate">{i.title}</span><Badge s={i.status} /></p>) : <p className="text-sm text-navy-500">None. All clear.</p>}</>)}
        </Card>
      </div>
      <h2 className="mb-3 mt-12 text-2xl font-semibold">Directory</h2>
      <div className="relative mb-5 max-w-md"><Search size={16} className="absolute left-3 top-3.5 text-navy-500" aria-hidden="true" /><input aria-label="Search directory" className="input !pl-9" placeholder="Search services, offices, contacts" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {dir.length === 0 && <EmptyState title="No matches">Try a different word.</EmptyState>}
      {groups.map((g) => (
        <section key={g} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy-500">{g}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dir.filter((d) => d.group === g).map((d) => (
              <Card key={d.name} className="!p-4"><p className="font-semibold">{d.name}</p><p className="text-sm text-navy-500">{d.detail}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium"><Phone size={13} aria-hidden="true" />{d.ext}</p>
                <button onClick={() => { setSel(d.building); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"><MapPin size={12} aria-hidden="true" />Show on map</button></Card>
            ))}
          </div>
        </section>
      ))}
      <p className="text-xs text-navy-500">All extensions and hours are sample text, not real contacts.</p>
    </Page>
  )
}
