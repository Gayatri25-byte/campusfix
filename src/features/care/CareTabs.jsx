import { useStore } from '../../app/StoreProvider.jsx'

// Sub-navigation shared by every Campus Care page.
export default function CareTabs({ current }) {
  const { role, issues, me } = useStore()
  const waiting = issues.filter((i) => i.status === 'Resolved' && i.reporterId === me?.id).length
  const tabs = [
    ['report', 'Report issue'],
    ['reports', 'My reports'],
    ['proof', 'Proof of fix', waiting],
    ...(role === 'staff' || role === 'admin' ? [['care-desk', 'Care desk']] : []),
  ]
  return (
    <nav aria-label="Campus Care" className="mb-6 flex flex-wrap gap-2">
      {tabs.map(([k, l, n]) => (
        <a
          key={k}
          href={'#/' + k}
          aria-current={current === k ? 'page' : undefined}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${current === k ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-teal-50'}`}
        >
          {l}
          {n ? <span className="ml-1.5 rounded-full bg-teal-500 px-1.5 text-[11px] text-navy-950">{n}</span> : null}
        </a>
      ))}
    </nav>
  )
}
