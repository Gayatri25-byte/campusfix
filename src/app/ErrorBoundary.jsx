import { Component } from 'react'

// Stops one broken page from blanking the whole app.
export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <main role="alert" className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">This page hit a problem</h1>
        <p className="mt-2 text-navy-500">Your data is safe. Go back to the dashboard or reload the page.</p>
        <a href="#/dashboard" className="mt-5 inline-block rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-navy-950">
          Back to dashboard
        </a>
      </main>
    )
  }
}
