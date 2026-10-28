// SAMPLE campus layout and directory. Invented for the demo: not a real college, map or phone list.
// `keys` are lowercase words used to match free-text issue locations to a building.
export const BUILDINGS = [
  { id: 'admin', name: 'Administration Block', x: 40, y: 40, w: 150, h: 80, tone: 'navy', keys: ['administration', 'admin block'], desc: 'Registrar, accounts and the principal’s office.', hours: 'Mon–Fri 9:00–17:00', ext: 'Ext. 100' },
  { id: 'library', name: 'Central Library', x: 230, y: 40, w: 150, h: 80, tone: 'teal', keys: ['library'], desc: 'Reading halls, study rooms and the found-items desk.', hours: 'Mon–Sat 8:00–21:00', ext: 'Ext. 140' },
  { id: 'blockA', name: 'Academic Block A', x: 420, y: 40, w: 140, h: 80, tone: 'navy', keys: ['academic block a'], desc: 'Lecture halls 101–310.', hours: 'Mon–Sat 8:00–18:00', ext: 'Ext. 201' },
  { id: 'blockB', name: 'Academic Block B', x: 600, y: 40, w: 140, h: 80, tone: 'navy', keys: ['academic block b'], desc: 'Seminar rooms and faculty offices.', hours: 'Mon–Sat 8:00–18:00', ext: 'Ext. 202' },
  { id: 'science', name: 'Science Block', x: 40, y: 190, w: 150, h: 90, tone: 'mint', keys: ['science block', 'lab'], desc: 'Physics, chemistry and computing labs.', hours: 'Mon–Fri 9:00–17:30', ext: 'Ext. 230' },
  { id: 'auditorium', name: 'Auditorium', x: 250, y: 200, w: 130, h: 70, tone: 'sand', keys: ['auditorium'], desc: 'Talks, hackathon kick-offs and cultural nights.', hours: 'Event days', ext: 'Ext. 260' },
  { id: 'canteen', name: 'Canteen', x: 430, y: 200, w: 110, h: 70, tone: 'sand', keys: ['canteen'], desc: 'Meals, snacks and the student feedback board.', hours: 'Daily 8:00–20:00', ext: 'Ext. 180' },
  { id: 'sports', name: 'Sports Complex', x: 580, y: 190, w: 160, h: 90, tone: 'mint', keys: ['sports', 'ground', 'gym'], desc: 'Courts, gym and the main ground.', hours: 'Daily 6:00–20:00', ext: 'Ext. 290' },
  { id: 'hostelB', name: 'Hostel B', x: 40, y: 330, w: 150, h: 70, tone: 'navy', keys: ['hostel b'], desc: 'Residential block with warden’s office.', hours: '24 hours', ext: 'Ext. 320' },
  { id: 'health', name: 'Health Centre', x: 250, y: 335, w: 130, h: 65, tone: 'teal', keys: ['health'], desc: 'First aid and counselling.', hours: 'Mon–Sat 9:00–17:00', ext: 'Ext. 220' },
  { id: 'security', name: 'Security Gate', x: 430, y: 340, w: 110, h: 60, tone: 'navy', keys: ['security', 'gate'], desc: '24/7 emergency and escort service.', hours: '24 hours', ext: 'Ext. 100' },
]
export const buildingFor = (location = '') => {
  const l = location.toLowerCase()
  return BUILDINGS.find((b) => b.keys.some((k) => l.includes(k)))
}
export const DIRECTORY = [
  { group: 'Emergency & safety', name: 'Campus Security', detail: '24/7 emergency and escort service', ext: 'Ext. 100 (sample)', building: 'security' },
  { group: 'Emergency & safety', name: 'Health Centre', detail: 'First aid and counselling', ext: 'Ext. 220 (sample)', building: 'health' },
  { group: 'Student services', name: 'IT Help Desk', detail: 'Wi-Fi, accounts, lab systems', ext: 'Ext. 310 (sample)', building: 'science' },
  { group: 'Student services', name: 'Library Desk', detail: 'Borrowing, study rooms, found items', ext: 'Ext. 140 (sample)', building: 'library' },
  { group: 'Student services', name: 'Canteen Office', detail: 'Meal plans and feedback', ext: 'Ext. 180 (sample)', building: 'canteen' },
  { group: 'Administration', name: 'Registrar', detail: 'Certificates, enrolment, ID cards', ext: 'Ext. 105 (sample)', building: 'admin' },
  { group: 'Administration', name: 'Accounts Office', detail: 'Fees and refunds', ext: 'Ext. 108 (sample)', building: 'admin' },
  { group: 'Academic', name: 'Computer Science Dept.', detail: 'Faculty offices and project labs', ext: 'Ext. 205 (sample)', building: 'blockB' },
  { group: 'Academic', name: 'Examination Cell', detail: 'Hall tickets and exam schedules', ext: 'Ext. 112 (sample)', building: 'admin' },
  { group: 'Facilities', name: 'Facilities Team', detail: 'Repairs, furniture, cleanliness', ext: 'Ext. 330 (sample)', building: 'hostelB' },
  { group: 'Facilities', name: 'Sports Office', detail: 'Court booking and teams', ext: 'Ext. 291 (sample)', building: 'sports' },
]
