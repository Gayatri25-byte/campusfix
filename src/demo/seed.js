// DEMO DATA ONLY. Everything below is invented sample data for the hackathon demo.
// It does not describe any real college, person, room or event.
const ago = (d, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString()
const ahead = (d, h = 0) => new Date(Date.now() + d * 864e5 + h * 36e5).toISOString()
const tl = (...e) => e.map(([status, note, d, h]) => ({ status, note, at: ago(d, h) }))
let n = 0
const mk = (title, category, location, priority, description, status, days, extra = {}) => ({
  id: 'CF-' + (1001 + n++),
  title,
  category,
  location,
  priority,
  description,
  status,
  createdAt: ago(days),
  assignee: status === 'Submitted' ? null : 'Facilities Team',
  affected: 1,
  reporterId: 'u-s2',
  affectedBy: ['u-s2'],
  safety: false,
  photo: null,
  proof: null,
  demo: true,
  timeline: tl(
    ['Submitted', 'Report received', days, 0],
    ...(status === 'Submitted' ? [] : [['Assigned', 'Assigned to a team', days - 0.5, 0]]),
    ...(['In Progress', 'Resolved', 'Verified'].includes(status)
      ? [['In Progress', 'Work started', days - 1, 0]]
      : []),
  ),
  ...extra,
})
export const buildSeedData = () => {
  n = 0
  const resolved = (i) => ({
    proof: { note: 'Replaced the faulty unit and tested for an hour.', photo: null, at: ago(1) },
    timeline: [...i.timeline, { status: 'Resolved', note: 'Fix completed with proof uploaded', at: ago(1) }],
  })
  const base = [
    mk(
      'Wi-Fi drops every few minutes',
      'Wi-Fi & Network',
      'Central Library, Floor 2',
      'High',
      'Connection drops during study hours; many students affected.',
      'In Progress',
      6,
      { reporterId: 'u-student', affected: 14, assignee: 'IT Support' },
    ),
    mk(
      'No Wi-Fi in reading hall',
      'Wi-Fi & Network',
      'Central Library, Floor 2',
      'Medium',
      'Access point seems offline.',
      'Assigned',
      18,
      { affected: 5, assignee: 'IT Support' },
    ),
    mk(
      'Wi-Fi extremely slow',
      'Wi-Fi & Network',
      'Central Library, Floor 2',
      'Medium',
      'Speeds under 1 Mbps in the evening.',
      'Resolved',
      40,
      { affected: 3, assignee: 'IT Support' },
    ),
    mk(
      'Water cooler leaking',
      'Plumbing & Water',
      'Hostel B, Ground Floor',
      'High',
      'Puddle forming near the stairs; slip risk.',
      'Submitted',
      1,
      { reporterId: 'u-student', affected: 4, safety: true },
    ),
    mk(
      'Water cooler not cooling',
      'Plumbing & Water',
      'Hostel B, Ground Floor',
      'Low',
      'Only room-temperature water.',
      'Verified',
      30,
      { affected: 2 },
    ),
    mk(
      'Broken projector in Room 304',
      'Classroom Equipment',
      'Academic Block A, Room 304',
      'Medium',
      'Projector shows a green tint and flickers.',
      'Resolved',
      5,
      { reporterId: 'u-student', assignee: 'Electrical Dept' },
    ),
    mk(
      'Flickering corridor lights',
      'Electrical',
      'Academic Block B, Floor 1',
      'Low',
      'Three tube lights flicker constantly.',
      'Assigned',
      3,
      { assignee: 'Electrical Dept' },
    ),
    mk(
      'Wobbly desks in Lab 2',
      'Furniture',
      'Science Block, Lab 2',
      'Low',
      'Four desks wobble and need leg adjustment.',
      'Submitted',
      2,
      { reporterId: 'u-student' },
    ),
  ]
  base[2] = { ...base[2], ...resolved(base[2]) }
  base[5] = { ...base[5], ...resolved(base[5]) }
  base[4] = {
    ...base[4],
    ...resolved(base[4]),
    timeline: [
      ...resolved(base[4]).timeline,
      { status: 'Verified', note: 'Student confirmed the fix', at: ago(0.5) },
    ],
  }
  const issues = base.map((i) => ({ ...i, affectedBy: [i.reporterId] }))
  return { issues, ...buildCampusData() }
}

const user = (id, name, role, extra = {}) => ({ id, name, role, active: true, demo: true, ...extra })
function buildCampusData() {
  const users = [
    user('u-student', 'Aarav Mehta', 'student', { dept: 'Computer Science', year: 2 }),
    user('u-faculty', 'Dr. Isha Rao', 'faculty', { dept: 'Computer Science' }),
    user('u-staff', 'Kabir Singh', 'staff', { team: 'IT Support' }),
    user('u-organizer', 'Meera Nair', 'organizer', { club: 'Tech Club' }),
    user('u-admin', 'Nikhil Joshi', 'admin', { dept: 'Administration' }),
    user('u-s2', 'Riya Sharma', 'student', { dept: 'Mechanical', year: 3 }),
    user('u-s3', 'Dev Patel', 'student', { dept: 'Computer Science', year: 2 }),
    user('u-s4', 'Sana Khan', 'student', { dept: 'Electronics', year: 1 }),
  ]
  const ev = (id, title, type, d, h, location, capacity, description, status = 'approved', club = 'Tech Club') => ({
    id, title, type, startsAt: ahead(d, h), location, capacity, description, status, club,
    organizerId: 'u-organizer', demo: true,
  })
  const events = [
    ev('EV-1', 'Git & GitHub for beginners', 'Workshop', 2, 0, 'Science Block, Lab 2', 40, 'Hands-on session: commits, branches and your first pull request. Bring a laptop.'),
    ev('EV-2', 'CampusHack 24-hour hackathon', 'Hackathon', 9, 0, 'Auditorium', 120, 'Build something that makes campus life better. Teams of up to four.'),
    ev('EV-3', 'Robotics bootcamp (small group)', 'Bootcamp', 5, 0, 'Academic Block B, Room 12', 3, 'Three seats only so everyone gets a kit. A waitlist opens when full.', 'approved', 'Robotics Club'),
    ev('EV-4', 'Sunrise photography walk', 'Club activity', 4, -6, 'Sports Complex', 25, 'Golden-hour photo walk around the grounds.', 'approved', 'Photography Club'),
    ev('EV-5', 'Cultural night', 'Cultural', 14, 0, 'Auditorium', 300, 'Music, dance and student stalls.', 'approved', 'Cultural Committee'),
    ev('EV-6', 'AI careers talk with alumni', 'Talk', 12, 0, 'Auditorium', 150, 'Three alumni share how they started in AI.', 'pending'),
  ]
  const reg = (id, eventId, userId, status = 'registered') => ({ id, eventId, userId, status, checkedIn: false, at: ago(1, Number(id.slice(2))) })
  const regs = [
    reg('R-1', 'EV-1', 'u-s2'), reg('R-2', 'EV-1', 'u-s3'),
    reg('R-3', 'EV-3', 'u-s2'), reg('R-4', 'EV-3', 'u-s3'), reg('R-5', 'EV-3', 'u-s4'),
    reg('R-6', 'EV-2', 'u-s3'),
  ]
  const ann = (id, title, body, audience = 'all', d = 0, pinned = false, by = 'u-admin') => ({ id, title, body, audience, pinned, authorId: by, at: ago(d), demo: true })
  const announcements = [
    ann('AN-1', 'Library open late during exam week', 'The Central Library will stay open until 23:00 from next Monday.', 'all', 0.2, true),
    ann('AN-2', 'Hostel B water tank cleaning', 'Water supply will pause 10:00–12:00 on Saturday. Please store water.', 'all', 1, false, 'u-staff'),
    ann('AN-3', 'Mid-semester marks upload', 'Faculty: please upload internal marks before Friday.', 'faculty', 1.5),
    ann('AN-4', 'Student ID photo day', 'Collect your new ID card from the Registrar this week.', 'student', 2),
  ]
  const ac = (id, kind, title, detail, course, d, by = 'u-faculty') => ({ id, kind, title, detail, course, at: ago(0.5), dueAt: ahead(d), authorId: by, demo: true })
  const academic = [
    ac('AC-1', 'exam', 'Data Structures mid-semester exam', 'Hall 2, 10:00. Syllabus: units 1–3. Carry your ID card.', 'CS201', 6),
    ac('AC-2', 'deadline', 'Assignment 3: graph algorithms', 'Submit the PDF report and source code.', 'CS201', 3),
    ac('AC-3', 'class_update', 'Room change: Thursday lecture', 'Moved from Room 304 to Room 210 because of projector repairs.', 'CS201', 2),
    ac('AC-4', 'deadline', 'Mini-project proposal', 'One-page proposal with team members.', 'CS230', 8),
    ac('AC-5', 'notice', 'Holiday: Founders’ Day', 'No classes. Library closed.', '', 11, 'u-admin'),
  ]
  const slot = (day, start, end, course, room, who = 'Dr. Isha Rao') => ({ day, start, end, course, room, who })
  const schedule = [
    slot('Mon', '09:00', '10:00', 'CS201 Data Structures', 'Block A · 304'),
    slot('Mon', '11:00', '13:00', 'CS210 Database Lab', 'Science Block · Lab 2', 'Prof. Anand'),
    slot('Tue', '10:00', '11:00', 'MA202 Discrete Maths', 'Block B · 105', 'Prof. Gupta'),
    slot('Tue', '14:00', '15:00', 'CS201 Data Structures', 'Block A · 304'),
    slot('Wed', '09:00', '11:00', 'CS230 Web Development', 'Science Block · Lab 1', 'Dr. Isha Rao'),
    slot('Wed', '13:00', '14:00', 'HS101 Communication Skills', 'Block B · 201', 'Ms. Fernandes'),
    slot('Thu', '09:00', '10:00', 'CS201 Data Structures', 'Block A · 210'),
    slot('Thu', '11:00', '12:00', 'MA202 Discrete Maths', 'Block B · 105', 'Prof. Gupta'),
    slot('Fri', '10:00', '12:00', 'CS210 Database Lab', 'Science Block · Lab 2', 'Prof. Anand'),
    slot('Fri', '14:00', '15:00', 'CS230 Web Development', 'Science Block · Lab 1', 'Dr. Isha Rao'),
  ]
  const feedback = [
    { id: 'FB-1', title: 'More study seats in the library', body: 'Seats fill by 10am during exam weeks.', category: 'Facilities', authorId: 'u-s2', anonymous: false, status: 'Under review', hidden: false, at: ago(5), demo: true },
    { id: 'FB-2', title: 'Vegetarian option at the late counter', body: 'After 7pm there is only one choice.', category: 'Food & canteen', authorId: 'u-s3', anonymous: true, status: 'Open', hidden: false, at: ago(3), demo: true },
    { id: 'FB-3', title: 'Evening shuttle to the metro station', body: 'A 7pm and 8pm shuttle would help hostel students.', category: 'Transport', authorId: 'u-s4', anonymous: false, status: 'Planned', hidden: false, at: ago(8), demo: true },
    { id: 'FB-4', title: 'Rude post (sample for moderation)', body: 'This sample entry shows how moderators hide inappropriate posts.', category: 'Other', authorId: 'u-s3', anonymous: true, status: 'Open', hidden: true, at: ago(2), demo: true },
  ]
  const votes = [
    ['FB-1', 'u-student'], ['FB-1', 'u-s3'], ['FB-1', 'u-s4'], ['FB-2', 'u-s2'], ['FB-3', 'u-s2'], ['FB-3', 'u-s3'],
  ].map(([feedbackId, userId]) => ({ feedbackId, userId }))
  const items = [
    { id: 'LF-1', type: 'lost', item: 'Blue water bottle (steel)', location: 'Canteen', contact: 'riya.demo@campus.example', privateDetail: '', date: ago(1), status: 'open', posterId: 'u-s2', demo: true },
    { id: 'LF-2', type: 'found', item: 'Black scientific calculator', location: 'Lab 2', contact: 'Science Block office', privateDetail: 'Initials “R.K.” are scratched on the back.', date: ago(2), status: 'claim_pending', posterId: 'u-staff', demo: true },
    { id: 'LF-3', type: 'found', item: 'Student ID card', location: 'Library entrance', contact: 'Library desk', privateDetail: 'The name on the card starts with the letter S.', date: ago(4), status: 'open', posterId: 'u-staff', demo: true },
  ]
  const claims = [
    { id: 'CL-1', itemId: 'LF-2', claimantId: 'u-s3', evidence: 'Casio model, my initials R.K. are scratched on the back and the battery cover is cracked.', status: 'pending', pickupCode: null, at: ago(1), demo: true },
  ]
  const notifications = [
    { id: 'N-1', userId: 'u-student', text: 'Your Wi-Fi report CF-1001 is now In Progress.', link: 'reports', at: ago(0.3), read: false },
    { id: 'N-2', userId: 'u-student', text: 'Your projector report CF-1006 was fixed. Please verify it.', link: 'proof', at: ago(1), read: false },
    { id: 'N-3', userId: 'u-student', text: 'Welcome to CampusFix. This is demo data.', link: 'dashboard', at: ago(3), read: true },
  ]
  return { users, events, regs, announcements, academic, schedule, feedback, votes, items, claims, notifications }
}
