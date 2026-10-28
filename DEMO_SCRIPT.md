# Five-minute hackathon demo

Start with **Reset demo data** (yellow banner). Keep the app on the landing page.

| Time | Do this | Say this |
|---|---|---|
| 0:00 | Landing page: scroll past the campus scene, upcoming events, map preview | “CampusFix connects students, faculty, staff and administration on one platform.” |
| 0:30 | **Sign in → Student (Aarav)**. Point at the dashboard: timetable, deadlines, events, activity, bell (2 unread) | “Every role gets a personalised home.” |
| 1:00 | **Campus Care → Report issue**: tick *safety concern*, submit. Open **My reports** and expand it | “Safety reports are auto-High and alert administrators. Every step is on a timeline.” |
| 1:45 | Sign out → **Facility Staff (Kabir)** → Care desk → assign, *Resolve with proof* | “Staff must give proof to resolve.” |
| 2:15 | Sign in as **Aarav** → bell → **Proof of fix** → *Confirm it’s fixed* | “Fixed means verified by the person who reported it.” |
| 2:45 | **Lost & Found** as Aarav: claim *Student ID card* with evidence. Point out the private detail is not visible | “Ownership is proven privately, never shown publicly.” |
| 3:15 | **Staff (Kabir)** → Lost & Found → approve claim. **Aarav** sees the pickup code. **Staff** enters it → Returned | “Secure handover with a code only the claimant sees.” |
| 3:45 | **Events** as Aarav: *Join waitlist* on the Robotics bootcamp. Then **Organizer (Meera)** → workspace → check people in | “Capacity, waitlist and check-in.” |
| 4:15 | **Admin (Nikhil)** → approve the pending event, open Users & roles, then **Analytics** | “Approvals, roles, and analytics computed from real stored data, labelled as demo.” |
| 4:45 | **Campus map**: click Central Library, show open-issue pins | “Everything connects to places on campus.” Close with the vision line. |

## Be upfront with judges
Sign-in here picks a demo persona. It is **not** real authentication. Real security (Supabase Auth + RLS) is written as SQL and documented but not connected yet.

## Fallback if the internet fails
- The app is fully offline after it loads. Run `npm run build && npm run preview` before the demo and keep that tab open.
- The only online resource is Google Fonts; without it the app falls back to system fonts and still works.
- If the page misbehaves: click **Reset demo data**. If it will not load: clear this site’s storage in browser dev tools and reload.
- Keep screenshots of each step as the last resort.
- If Supabase is mentioned, show `supabase/migrations` and `tests/rls_checks.sql` instead of a live demo.
