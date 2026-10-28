// Chooses which data adapter the app uses. Pages import `service` from here and never care which one it is.
import { supabaseEnvPresent } from '../config/env.js'
import { localService } from './local/index.js'
import { supabaseService, SUPABASE_ADAPTER_READY } from './supabase/index.js'

// Real mode needs BOTH Supabase settings in .env AND a finished adapter. Phase 1 has no finished adapter,
// so the app always runs in demo mode and never pretends otherwise.
export const service = supabaseEnvPresent && SUPABASE_ADAPTER_READY ? supabaseService : localService
export const isDemoMode = service.mode === 'demo'
export { supabaseEnvPresent }
