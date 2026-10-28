// Reads settings from the .env file (see .env.example). Vite only exposes names starting with VITE_.
// Never put a Supabase "service_role" key here: anything in VITE_ variables is visible to every visitor.
export const supabaseEnvPresent = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)
