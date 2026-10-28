// ILLUSTRATIVE campus map: building positions are invented for the demo, not a real survey.
import { BUILDINGS } from '../config/campus.js'

const FILL = { navy: '#13294f', teal: '#0d9488', mint: '#1f9a6c', sand: '#c9b896' }

export default function CampusMap({ selected, onSelect, pins = {}, compact = false }) {
  return (
    <svg viewBox="0 0 780 430" role="group" aria-label="Illustrative campus map" className="h-auto w-full rounded-2xl bg-mint-50">
      <rect x="0" y="0" width="780" height="430" fill="#effaf5" />
      <rect x="0" y="146" width="780" height="26" fill="#e6dccb" />
      <rect x="0" y="296" width="780" height="22" fill="#e6dccb" />
      <rect x="205" y="0" width="20" height="430" fill="#e6dccb" />
      <rect x="395" y="0" width="20" height="430" fill="#e6dccb" />
      {[[560, 140], [570, 300], [200, 130], [770, 150]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="9" fill="#a9e6cb" />
      ))}
      {BUILDINGS.map((b) => {
        const on = selected === b.id
        const n = pins[b.id] || 0
        return (
          <g
            key={b.id}
            className="bldg"
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={b.name + (n ? ', ' + n + ' open issue' + (n > 1 ? 's' : '') : '')}
            onClick={() => onSelect?.(b.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect?.(b.id))}
          >
            <rect x={b.x + 4} y={b.y + 6} width={b.w} height={b.h} rx="10" fill="#08142a" opacity=".12" />
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="10" fill={FILL[b.tone]} stroke={on ? '#14b8a6' : 'none'} strokeWidth="4" />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle" fontSize={compact ? 11 : 12.5} fontWeight="600" fill={b.tone === 'sand' ? '#08142a' : '#fff'}>
              {b.name.length > 18 ? b.name.replace(' Block', '') : b.name}
            </text>
            {n > 0 && (
              <g>
                <circle cx={b.x + b.w - 8} cy={b.y + 8} r="13" className="pin-pulse" fill="#e11d48" opacity=".4" />
                <circle cx={b.x + b.w - 8} cy={b.y + 8} r="11" fill="#e11d48" />
                <text x={b.x + b.w - 8} y={b.y + 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{n}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
