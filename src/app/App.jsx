import Layout from './Layout.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { routes, useHashRoute } from './routes.jsx'
import { useStore } from './StoreProvider.jsx'
import SignIn from '../features/auth/SignIn.jsx'
import { Page, Card } from '../components/ui/index.jsx'
import { ShieldAlert } from 'lucide-react'

export default function App() {
  const path = useHashRoute()
  const { me } = useStore()
  const route = routes[path] || routes['']
  const Comp = route.component

  let page = <Comp />
  if (!route.public && !me) page = <SignIn needed />
  else if (route.roles && !route.roles.includes(me?.role))
    page = (
      <Page title="Not available for your role">
        <Card className="mx-auto max-w-md text-center hover:!translate-y-0">
          <ShieldAlert className="mx-auto text-teal-600" aria-hidden="true" />
          <p className="mt-3 text-navy-700">
            This area is for {route.roles.join(' / ')} accounts. In the real backend this is enforced by database
            policies, not just by hiding the page.
          </p>
          <a href="#/dashboard" className="mt-4 inline-block font-semibold text-teal-700">
            Back to your dashboard
          </a>
        </Card>
      </Page>
    )

  return (
    <Layout path={path}>
      <ErrorBoundary resetKey={path + (me?.id || '')}>{page}</ErrorBoundary>
    </Layout>
  )
}
