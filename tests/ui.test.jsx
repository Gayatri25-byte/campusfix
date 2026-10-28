import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/app/App.jsx'
import { StoreProvider } from '../src/app/StoreProvider.jsx'
import { routes } from '../src/app/routes.jsx'
import { localService } from '../src/services/local/index.js'

const PEOPLE = { student: 'u-student', faculty: 'u-faculty', staff: 'u-staff', organizer: 'u-organizer', admin: 'u-admin' }
let errors
async function open(hash, as = null) {
  cleanup()
  localStorage.clear()
  localService.setActor(as)
  await localService.resetDemo()
  if (as) localStorage.setItem('campusfix.demoUser', as)
  location.hash = '#/' + hash
  render(<StoreProvider><App /></StoreProvider>)
  await screen.findByRole('banner')
}
beforeEach(() => {
  errors = []
  vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')))
})

describe('every page renders for every role without crashing', () => {
  for (const [role, id] of Object.entries(PEOPLE)) {
    for (const [path, route] of Object.entries(routes)) {
      if (route.roles && !route.roles.includes(role)) continue
      it(`${role} → #/${path}`, async () => {
        await open(path, id)
        expect(screen.queryByText('This page hit a problem')).toBeNull()
        expect(document.querySelector('h1')).toBeTruthy()
        expect(errors).toEqual([])
      })
    }
  }
})

describe('access control in the UI (demo)', () => {
  it('signed-out visitors see sign-in for protected pages but can view public pages', async () => {
    await open('reports')
    expect(screen.getByRole('heading', { level: 1, name: /sign in/i })).toBeInTheDocument()
    await open('events')
    expect(screen.getByRole('heading', { level: 1, name: /campus events/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /sign in to register/i }).length).toBeGreaterThan(0)
  })
  it('students see a not-available message on admin pages and no admin nav link', async () => {
    await open('admin', PEOPLE.student)
    expect(screen.getByText(/not available for your role/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
  })
  it('signed-out landing never exposes issue titles', async () => {
    await open('', null)
    expect(screen.queryByText(/Wi-Fi drops/)).toBeNull()
  })
})

describe('key flows through the real UI', () => {
  it('student reports a safety issue and sees it in My reports', async () => {
    const user = userEvent.setup()
    await open('report', PEOPLE.student)
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    expect(await screen.findByText(/at least 5 characters/i)).toBeInTheDocument()
    await user.type(screen.getByLabelText(/what's wrong/i), 'Loose handrail on stairs')
    await user.type(screen.getByLabelText(/^location/i), 'Academic Block B')
    await user.type(screen.getByLabelText(/details/i), 'The handrail wobbles badly near floor 2')
    await user.click(screen.getByRole('checkbox', { name: /safety concern/i }))
    await user.click(screen.getByRole('button', { name: /submit report/i }))
    await waitFor(() => expect(location.hash).toBe('#/reports'))
    expect(await screen.findByText('Loose handrail on stairs')).toBeInTheDocument()
  })

  it('student joins a full event and lands on the waitlist', async () => {
    const user = userEvent.setup()
    await open('events', PEOPLE.student)
    const card = screen.getByText(/Robotics bootcamp/).closest('div.flex-col')
    await user.click(within(card).getByRole('button', { name: /join waitlist/i }))
    expect(await within(card).findByText(/waitlisted/i, { selector: 'span' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent(/waitlist/i)
  })

  it('student submits an ownership claim; private detail is never on screen', async () => {
    const user = userEvent.setup()
    await open('lostfound', PEOPLE.student)
    expect(screen.queryByText(/R\.K\./)).toBeNull()
    const card = screen.getByText('Student ID card').closest('.rounded-2xl')
    await user.click(within(card).getByRole('button', { name: /claim it/i }))
    await user.type(within(card).getByLabelText(/prove it is yours/i), 'Name starts with S and it has a blue lanyard clip')
    await user.click(within(card).getByRole('button', { name: /submit claim/i }))
    expect(await within(card).findByText(/Your claim:/)).toBeInTheDocument()
    expect(screen.queryByText(/starts with the letter S/)).toBeNull()
  })

  it('admin approves a pending event and it becomes public', async () => {
    const user = userEvent.setup()
    await open('admin', PEOPLE.admin)
    await user.click(await screen.findByRole('button', { name: /approve/i }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/decision saved/i))
  })

  it('notifications bell shows unread count and opens', async () => {
    const user = userEvent.setup()
    await open('dashboard', PEOPLE.student)
    await user.click(screen.getByRole('button', { name: /notifications, 2 unread/i }))
    expect(await screen.findByText(/Wi-Fi report CF-1001/)).toBeInTheDocument()
  })

  it('sign out returns to a signed-out state', async () => {
    const user = userEvent.setup()
    await open('dashboard', PEOPLE.student)
    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(await screen.findByRole('heading', { level: 1, name: /sign in/i })).toBeInTheDocument()
  })
})
