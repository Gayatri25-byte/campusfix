// One place to edit navigation. `roles` omitted = shown to everyone who is signed in.
// `public` links are shown even when signed out.
export const NAV_LINKS = [
  { path: 'dashboard', label: 'Home' },
  { path: 'reports', label: 'Campus Care', match: ['report', 'reports', 'proof', 'care-desk'] },
  { path: 'events', label: 'Events', public: true },
  { path: 'academic', label: 'Academic' },
  { path: 'lostfound', label: 'Lost & Found' },
  { path: 'community', label: 'Community' },
  { path: 'campus', label: 'Campus map', public: true },
  { path: 'workspace', label: 'Workspace', roles: ['faculty', 'staff', 'organizer'] },
  { path: 'admin', label: 'Admin', roles: ['admin'] },
  { path: 'analytics', label: 'Analytics', roles: ['admin'] },
]
