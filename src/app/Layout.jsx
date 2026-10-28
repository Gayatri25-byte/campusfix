// The frame around every page: demo banner, navigation, notification bell, user menu and footer.
import { useEffect, useRef, useState } from 'react'
import { Menu, X, Bell, LogOut, GraduationCap } from 'lucide-react'
import { NAV_LINKS } from '../config/nav.js'
import { ROLE_LABEL } from '../config/roles.js'
import { useStore } from './StoreProvider.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import { Avatar, ago } from '../components/ui/index.jsx'

function Bell_() {
  const { notifications, markRead, markAllRead } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const unread = notifications.filter((n) => !n.read).length
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-teal-500/10"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="pop absolute right-0 z-50 mt-2 w-80 max-w-[85vw] rounded-2xl border border-navy-100 bg-white p-2 text-navy-900 shadow-lift">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="font-display text-lg font-semibold">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-teal-700">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 && <p className="px-3 pb-3 text-sm text-navy-500">Nothing yet.</p>}
          <ul className="max-h-80 overflow-auto">
            {notifications.slice(0, 12).map((n) => (
              <li key={n.id}>
                <a
                  href={'#/' + n.link}
                  onClick={() => {
                    markRead(n.id)
                    setOpen(false)
                  }}
                  className={`block rounded-lg px-3 py-2 text-sm hover:bg-teal-50 ${n.read ? 'text-navy-500' : 'font-medium'}`}
                >
                  {n.text}
                  <span className="block text-xs font-normal text-navy-500">{ago(n.at)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Layout({ path, children }) {
  const { me, signOut } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const dark = path === ''
  useEffect(() => setMenuOpen(false), [path])

  const links = NAV_LINKS.filter((l) => (me ? !l.roles || l.roles.includes(me.role) : l.public))
  const isActive = (l) => path === l.path || l.match?.includes(path)
  const headerStyle = dark ? 'border-white/10 bg-navy-950/80 text-white' : 'border-navy-100 bg-white/85'
  const linkStyle = (a) => (a ? 'bg-teal-500/15 text-teal-600' : dark ? 'text-white/75 hover:text-white' : 'text-navy-500 hover:text-navy-900')

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        Skip to content
      </a>
      <div className="sticky top-0 z-40">
        <DemoBanner />
        <header className={`border-b backdrop-blur ${headerStyle}`}>
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <a href={me ? '#/dashboard' : '#/'} className="flex items-center gap-2 font-display text-xl font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-500 text-navy-950">
                <GraduationCap size={18} aria-hidden="true" />
              </span>
              CampusFix
            </a>
            <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
              {links.map((l) => (
                <a key={l.path} href={'#/' + l.path} aria-current={isActive(l) ? 'page' : undefined} className={`rounded-lg px-2.5 py-2 text-sm font-medium transition ${linkStyle(isActive(l))}`}>
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-1.5">
              {me ? (
                <>
                  <Bell_ />
                  <div className="hidden items-center gap-2 sm:flex">
                    <Avatar name={me.name} className="!h-8 !w-8" />
                    <div className="leading-tight">
                      <p className="text-xs font-semibold">{me.name}</p>
                      <p className="text-[11px] opacity-60">{ROLE_LABEL[me.role]}</p>
                    </div>
                  </div>
                  <button onClick={signOut} aria-label="Sign out" title="Sign out" className="grid h-9 w-9 place-items-center rounded-full hover:bg-teal-500/10">
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                <a href="#/signin" className="rounded-full bg-teal-500 px-4 py-1.5 text-sm font-semibold text-navy-950 hover:bg-teal-400">
                  Sign in
                </a>
              )}
              <button className="grid h-9 w-9 place-items-center xl:hidden" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <nav aria-label="Mobile" className="pop grid gap-1 border-t border-navy-100/20 p-3 xl:hidden">
              {links.map((l) => (
                <a key={l.path} href={'#/' + l.path} aria-current={isActive(l) ? 'page' : undefined} className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isActive(l) ? 'bg-teal-500/15 text-teal-600' : ''}`}>
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </header>
      </div>
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <footer className="border-t border-navy-100 py-6 text-center text-xs text-navy-500">
        CampusFix hackathon prototype · demo data lives in your browser · items tagged “Demo data” are samples
      </footer>
    </>
  )
}
