import { useEffect, useRef, useState } from 'react'

const tone = {
  Submitted: 'bg-slate-100 text-slate-700',
  Assigned: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-sky-100 text-sky-800',
  Resolved: 'bg-teal-100 text-teal-700',
  Verified: 'bg-emerald-100 text-emerald-800',
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-700',
  registered: 'bg-emerald-100 text-emerald-800',
  waitlist: 'bg-amber-100 text-amber-800',
  collected: 'bg-emerald-100 text-emerald-800',
  open: 'bg-slate-100 text-slate-700',
  claim_pending: 'bg-amber-100 text-amber-800',
  disputed: 'bg-rose-100 text-rose-700',
  ready_for_pickup: 'bg-teal-100 text-teal-700',
  returned: 'bg-emerald-100 text-emerald-800',
  Safety: 'bg-rose-600 text-white',
  Open: 'bg-slate-100 text-slate-700',
  'Under review': 'bg-sky-100 text-sky-800',
  Planned: 'bg-amber-100 text-amber-800',
  Done: 'bg-emerald-100 text-emerald-800',
}
const LABEL = { claim_pending: 'Claim pending', ready_for_pickup: 'Ready for pickup', waitlist: 'Waitlisted' }
export const Badge = ({ s }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tone[s] || 'bg-slate-100 text-slate-700'}`}>{LABEL[s] || s}</span>
)
export const DemoTag = () => (
  <span
    className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500"
    title="Sample data seeded by CampusFix"
  >
    Demo data
  </span>
)

export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return el.classList.add('in')
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in')
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ transitionDelay: delay + 'ms' }} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

export function CountUp({ to }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setV(to)
    let raf, t0
    const tick = (t) => {
      t0 ??= t
      const p = Math.min((t - t0) / 900, 1)
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{v}</>
}

export const Card = ({ className = '', children, ...p }) => (
  <div
    {...p}
    className={`rounded-2xl border border-navy-100 bg-white p-5 shadow-lift transition hover:-translate-y-0.5 ${className}`}
  >
    {children}
  </div>
)

export function Btn({ variant = 'primary', className = '', ...p }) {
  const v = {
    primary: 'bg-teal-500 text-navy-950 hover:bg-teal-400',
    dark: 'bg-navy-800 text-white hover:bg-navy-700',
    ghost: 'border border-navy-200 bg-white text-navy-800 hover:border-teal-500 hover:text-teal-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }[variant]
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[.97] disabled:opacity-50 ${v} ${className}`}
    />
  )
}

export const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
    {children}
    {error && (
      <span role="alert" className="mt-1 block text-xs font-medium text-rose-600">
        {error}
      </span>
    )}
  </label>
)

export function Page({ title, sub, action, children }) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {sub && <p className="mt-1.5 max-w-xl text-navy-500">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </main>
  )
}

export const ago = (iso) => {
  const m = (Date.now() - new Date(iso)) / 6e4
  return m < 60
    ? Math.max(1, Math.round(m)) + 'm ago'
    : m < 1440
      ? Math.round(m / 60) + 'h ago'
      : Math.round(m / 1440) + 'd ago'
}

export function readImg(file) {
  return new Promise((res, rej) => {
    if (!file.type.startsWith('image/')) return rej(new Error('Please choose an image file.'))
    const r = new FileReader()
    r.onerror = () => rej(new Error('Could not read file.'))
    r.onload = () => {
      const im = new Image()
      im.onload = () => {
        const s = Math.min(1, 720 / im.width),
          c = document.createElement('canvas')
        c.width = im.width * s
        c.height = im.height * s
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
        res(c.toDataURL('image/jpeg', 0.7))
      }
      im.onerror = () => rej(new Error('Invalid image.'))
      im.src = r.result
    }
    r.readAsDataURL(file)
  })
}

export function PhotoInput({ value, onChange, label = 'Photo (optional)' }) {
  const [err, setErr] = useState('')
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Upload preview"
            className="h-36 rounded-lg border border-navy-100 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1.5 top-1.5 rounded-full bg-navy-900/80 px-2 py-0.5 text-xs text-white"
          >
            Remove
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            try {
              setErr('')
              e.target.files[0] && onChange(await readImg(e.target.files[0]))
            } catch (x) {
              setErr(x.message)
            }
          }}
          className="block w-full text-sm text-navy-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-700"
        />
      )}
      {err && (
        <p role="alert" className="mt-1 text-xs text-rose-600">
          {err}
        </p>
      )}
    </div>
  )
}

export function Timeline({ items }) {
  return (
    <ol className="relative ml-2 border-l-2 border-teal-100 pl-5">
      {items.map((t, i) => (
        <li key={i} className="mb-4 last:mb-0">
          <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-white bg-teal-500" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge s={t.status} />
            <span className="text-xs text-navy-500">{ago(t.at)}{t.by ? ' · ' + t.by : ''}</span>
          </div>
          <p className="mt-1 text-sm text-navy-700">{t.note}</p>
        </li>
      ))}
    </ol>
  )
}

export const Skeleton = ({ className = 'h-24' }) => <div aria-hidden="true" className={`skeleton rounded-2xl ${className}`} />

export const EmptyState = ({ icon: I, title, children, action }) => (
  <div className="rounded-2xl border border-dashed border-navy-200 bg-white/60 p-8 text-center">
    {I && <I className="mx-auto text-teal-600" aria-hidden="true" />}
    <p className="mt-2 font-semibold">{title}</p>
    {children && <p className="mx-auto mt-1 max-w-sm text-sm text-navy-500">{children}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="mb-6 flex flex-wrap gap-2">
      {tabs.map(([k, l, n]) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${value === k ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-teal-50'}`}
        >
          {l}
          {n ? <span className="ml-1.5 rounded-full bg-teal-500 px-1.5 text-[11px] text-navy-950">{n}</span> : null}
        </button>
      ))}
    </div>
  )
}

export const SuccessCheck = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#14b8a6" />
    <path d="M7 12.5l3.2 3.2L17 9" stroke="#050d1c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
  </svg>
)

export const Avatar = ({ name = '?', className = '' }) => (
  <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-800 text-xs font-semibold text-white ${className}`}>
    {name.split(' ').filter((w) => !/^(dr|prof|ms|mr)\.?$/i.test(w)).map((w) => w[0]).slice(0, 2).join('')}
  </span>
)

export const dateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
export const dayOnly = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
export const until = (iso) => {
  const d = Math.ceil((new Date(iso) - Date.now()) / 864e5)
  return d <= 0 ? 'today' : d === 1 ? 'tomorrow' : 'in ' + d + ' days'
}

export function SectionHead({ icon: I, title, link, linkLabel = 'View all' }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        {I && <I size={18} className="text-teal-600" aria-hidden="true" />}
        {title}
      </h2>
      {link && (
        <a href={'#/' + link} className="text-sm font-semibold text-teal-700 hover:underline">
          {linkLabel}
        </a>
      )}
    </div>
  )
}
