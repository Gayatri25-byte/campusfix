import { ArrowRight, Wrench, CalendarDays, PackageSearch, GraduationCap, Megaphone, MapPin, ShieldCheck, Users, BookOpen } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { Reveal, Btn, CountUp, dayOnly, ago } from '../../components/ui/index.jsx'
import CampusIllustration from '../../components/CampusIllustration.jsx'
import CampusMap from '../../components/CampusMap.jsx'

const pillars = [
  [Wrench, 'Campus Care', 'Report a problem, follow it on a timeline, and confirm the fix yourself.', 'reports'],
  [PackageSearch, 'Lost & Found', 'Claim items with private proof and a secure pickup code.', 'lostfound'],
  [CalendarDays, 'Events', 'Workshops, hackathons and clubs with seats, waitlists and check-in.', 'events'],
  [BookOpen, 'Academic life', 'Timetable, exam notices, deadlines and room changes in one place.', 'academic'],
  [Megaphone, 'Community voice', 'Announcements and suggestions that the whole campus can vote on.', 'community'],
  [MapPin, 'Campus map', 'Find buildings, services and who to call.', 'campus'],
]
const people = [
  ['Students', 'Everything for daily campus life, personalised.', GraduationCap],
  ['Faculty', 'Post notices, class updates and deadlines in seconds.', BookOpen],
  ['Facility staff', 'A clear repair queue with proof of fix.', Wrench],
  ['Organizers', 'Propose events, manage registrations, check in.', Users],
  ['Administrators', 'Approvals, roles, moderation and honest analytics.', ShieldCheck],
]

export default function Landing() {
  const { events, announcements, stats, me } = useStore()
  const upcoming = events.filter((e) => e.status === 'approved' && new Date(e.startsAt) > new Date()).sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 3)
  const news = announcements.filter((a) => a.audience === 'all').slice(0, 3)
  const nums = [
    [stats.reports, 'campus reports logged'],
    [stats.fixed, 'fixed or resolved'],
    [stats.returned, 'items returned'],
    [stats.events, 'upcoming events'],
  ]
  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="rise">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Smart Campus Life & Services
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              One place for everything that makes campus <span className="text-teal-400">work.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/70">
              CampusFix connects students, faculty, staff, and college administration to make everyday campus life easier, safer, and more connected.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={me ? '#/dashboard' : '#/signin'}>
                <Btn>
                  {me ? 'Open your dashboard' : 'Explore as a demo user'} <ArrowRight size={16} />
                </Btn>
              </a>
              <a href="#/events">
                <Btn variant="ghost" className="!border-white/25 !bg-transparent !text-white hover:!bg-white/10">
                  See upcoming events
                </Btn>
              </a>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {nums.map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold text-white">
                    <CountUp to={n} />
                  </dt>
                  <dd className="text-xs text-white/55">{l}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[11px] text-white/40">Counts come from the demo data in this browser.</p>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <CampusIllustration className="w-full drop-shadow-2xl" />
            <div className="float absolute -bottom-5 -left-3 hidden w-56 rounded-xl bg-teal-500 p-3.5 text-navy-950 shadow-lift sm:block" aria-hidden="true">
              <p className="text-xs font-semibold">Proof of fix uploaded</p>
              <p className="mt-0.5 text-sm">Projector, Room 304. Does it look fixed?</p>
            </div>
            <div className="float absolute -right-2 top-8 hidden w-48 rounded-xl border border-white/10 bg-navy-900/90 p-3 text-white shadow-lift backdrop-blur sm:block" style={{ animationDelay: '-2.5s' }} aria-hidden="true">
              <p className="text-xs text-teal-300">Tomorrow · 14:00</p>
              <p className="mt-0.5 text-sm">Git & GitHub workshop · 28 seats left</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-2xl font-semibold sm:text-3xl">Coming up on campus</h2>
              <a href="#/events" className="text-sm font-semibold text-teal-700">All events</a>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {upcoming.map((e) => (
                <a key={e.id} href="#/events" className="group rounded-2xl border border-navy-100 bg-white p-4 shadow-lift transition hover:-translate-y-1 hover:border-teal-400">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{e.type}</p>
                  <p className="mt-1 font-display text-lg font-semibold leading-snug">{e.title}</p>
                  <p className="mt-2 text-xs text-navy-500">{dayOnly(e.startsAt)} · {e.location}</p>
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">Campus updates</h2>
            <ul className="space-y-3">
              {news.map((a) => (
                <li key={a.id} className="rounded-xl bg-sand-100 p-3.5">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="mt-0.5 text-xs text-navy-500">{ago(a.at)}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">Built for the whole campus, not just the complaint box.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map(([I, t, d, link], i) => (
              <Reveal key={t} delay={i * 50}>
                <a href={'#/' + link} className="block h-full rounded-2xl border border-navy-100 bg-sand-50 p-6 transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-lift">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-600">
                    <I size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{t}</h3>
                  <p className="mt-1.5 text-sm text-navy-500">{d}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-semibold">Find your way around.</h2>
          <p className="mt-3 max-w-md text-navy-500">An illustrative map shows where each service lives and which buildings have open issues. Tap any building.</p>
          <a href="#/campus" className="mt-5 inline-block"><Btn variant="dark">Open campus map</Btn></a>
        </Reveal>
        <Reveal delay={100}>
          <a href="#/campus" aria-label="Open the campus map"><CampusMap compact /></a>
        </Reveal>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-6xl rounded-3xl bg-navy-900 p-8 text-white sm:p-12">
            <h2 className="text-3xl font-semibold">One platform, five roles.</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {people.map(([t, d, I]) => (
                <div key={t}>
                  <I size={20} className="text-teal-400" aria-hidden="true" />
                  <p className="mt-2 font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-white/60">{d}</p>
                </div>
              ))}
            </div>
            <a href="#/signin" className="mt-8 inline-block"><Btn>Choose a role to explore</Btn></a>
          </div>
        </Reveal>
      </section>
    </>
  )
}
