import { ShieldCheck, GraduationCap, BookOpen, Wrench, CalendarCheck, Lock } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { ROLE_LABEL } from '../../config/roles.js'
import { Page, Card, Btn, Field } from '../../components/ui/index.jsx'
import { supabaseEnvPresent } from '../../services/index.js'

const ICON = { student: GraduationCap, faculty: BookOpen, staff: Wrench, organizer: CalendarCheck, admin: ShieldCheck }
const BLURB = {
  student: 'Report issues, claim lost items, register for events, see your timetable.',
  faculty: 'Post notices and class updates, see your classes and campus activity.',
  staff: 'Work the repair queue, upload proof of fixes, hand over found items.',
  organizer: 'Propose events, manage registrations and check people in.',
  admin: 'Approve events, manage users and roles, moderate, see analytics.',
}

export default function SignIn({ needed }) {
  const { users, signIn, me, isDemo } = useStore()
  const demoPeople = users.filter((u) => u.demo && u.active && ['u-student', 'u-faculty', 'u-staff', 'u-organizer', 'u-admin'].includes(u.id))
  const go = async (id) => {
    await signIn(id)
    location.hash = '/dashboard'
  }
  return (
    <Page title="Sign in to CampusFix" sub={needed ? 'This area needs an account. Choose how you want to explore.' : 'Pick a role to explore the platform.'}>
      {isDemo ? (
        <>
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <b>Demo Mode:</b> these are invented people with sample data. Choosing one is <b>not authentication</b> and
            protects nothing. Real email sign-in is prepared for Supabase (see the setup guide) but not connected.
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoPeople.map((u, i) => {
              const I = ICON[u.role]
              return (
                <Card key={u.id} className="rise flex flex-col" style={{ animationDelay: i * 60 + 'ms' }}>
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-600">
                    <I size={20} aria-hidden="true" />
                  </span>
                  <h2 className="mt-3 text-lg font-semibold">{ROLE_LABEL[u.role]}</h2>
                  <p className="text-xs text-navy-500">Demo person: {u.name}</p>
                  <p className="mt-2 flex-1 text-sm text-navy-700">{BLURB[u.role]}</p>
                  <Btn className="mt-4 w-full" variant={me?.id === u.id ? 'ghost' : 'primary'} onClick={() => go(u.id)}>
                    {me?.id === u.id ? 'Continue as ' : 'Explore as '} {u.name.split(' ')[0]}
                  </Btn>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <Card className="mx-auto max-w-md hover:!translate-y-0">
          <Field label="College email">
            <input className="input" type="email" autoComplete="email" disabled />
          </Field>
          <Btn className="mt-4 w-full" disabled>
            <Lock size={15} /> Sign in
          </Btn>
        </Card>
      )}
      {supabaseEnvPresent && <p className="mt-6 text-sm text-navy-500">Supabase settings detected, but the adapter is not finished, so Demo Mode is used.</p>}
    </Page>
  )
}
