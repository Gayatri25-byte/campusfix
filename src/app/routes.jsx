// Maps the URL (#/dashboard, #/events ...) to a page. `public` pages work signed out; `roles` limits a page.
import { useEffect, useState } from 'react'
import Landing from '../features/home/Landing.jsx'
import Dashboard from '../features/home/Dashboard.jsx'
import SignIn from '../features/auth/SignIn.jsx'
import Report from '../features/care/Report.jsx'
import MyReports from '../features/care/MyReports.jsx'
import Proof from '../features/care/Proof.jsx'
import CareDesk from '../features/care/CareDesk.jsx'
import LostFound from '../features/lostfound/LostFound.jsx'
import Events from '../features/events/Events.jsx'
import Academic from '../features/academic/Academic.jsx'
import Community from '../features/community/Community.jsx'
import Campus from '../features/campus/Campus.jsx'
import Workspace from '../features/workspace/Workspace.jsx'
import Admin from '../features/admin/Admin.jsx'
import Analytics from '../features/analytics/Analytics.jsx'

export const routes = {
  '': { component: Landing, public: true },
  signin: { component: SignIn, public: true },
  dashboard: { component: Dashboard },
  report: { component: Report },
  reports: { component: MyReports },
  proof: { component: Proof },
  'care-desk': { component: CareDesk, roles: ['staff', 'admin'] },
  lostfound: { component: LostFound },
  events: { component: Events, public: true },
  academic: { component: Academic },
  community: { component: Community },
  campus: { component: Campus, public: true },
  workspace: { component: Workspace, roles: ['faculty', 'staff', 'organizer'] },
  admin: { component: Admin, roles: ['admin'] },
  analytics: { component: Analytics, roles: ['admin'] },
}

const readPath = () => location.hash.replace(/^#\/?/, '').split('?')[0]

// Returns the current path and re-renders when the URL hash changes.
export function useHashRoute() {
  const [path, setPath] = useState(readPath)
  useEffect(() => {
    const onChange = () => {
      setPath(readPath())
      window.scrollTo(0, 0)
    }
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return path
}
