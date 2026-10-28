import { Info } from 'lucide-react'
import { supabaseEnvPresent } from '../services/index.js'
import { useStore } from '../app/StoreProvider.jsx'

// Always visible at the top of every page while the app runs on demo data.
export default function DemoBanner() {
  const { resetDemo, isDemo } = useStore()
  if (!isDemo) return null
  const onReset = () => {
    if (window.confirm('Reset the demo data in this browser? Everything you added will be removed.')) resetDemo()
  }
  return (
    <div role="note" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-950">
      <Info size={14} className="shrink-0" aria-hidden="true" />
      <span>
        <b>Demo Mode.</b> Sample data saved only in this browser. “Sign in” picks a demo person, so it is not real
        authentication or security.
        {supabaseEnvPresent && ' Supabase settings were found, but the Supabase adapter is not finished yet.'}
      </span>
      <button onClick={onReset} className="font-semibold underline underline-offset-2 hover:no-underline">
        Reset demo data
      </button>
    </div>
  )
}
