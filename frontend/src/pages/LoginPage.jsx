import { GraduationCap, ShieldCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'

import { loginAccount, signupAccount } from '../api/client'

export function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('signin')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const update = (field, value) => {
    setMessage('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const switchMode = (nextMode) => {
    setMessage('')
    setMode(nextMode)
  }

  const signUp = async () => {
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim().toLowerCase()
    const password = form.password

    if (!firstName || !lastName) {
      setMessage('Enter your first and last name.')
      return
    }

    if (password.length < 6) {
      setMessage('Use at least 6 characters for the password.')
      return
    }

    if (password !== form.confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    // Role standardized to match the uppercase format used throughout the app
    const account = await signupAccount({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role: 'ACCOUNTPROFILE.STUDENT',
    })
    onLogin(account)
  }

  const signIn = async () => {
    const account = await loginAccount({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })
    onLogin(account)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      if (mode === 'signup') {
        await signUp()
      } else {
        await signIn()
      }
    } catch (error) {
      const data = error.response?.data
      const detail = data?.detail || data?.non_field_errors?.[0] || data?.email?.[0]
      setMessage(detail || 'Unable to complete the request. Check your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel auth-panel">
        <div className="login-form">
          <div className="brand-line">
            <div className="brand-mark">
              <GraduationCap size={24} />
            </div>
            <span>ILES Portal</span>
          </div>

          <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">
            {mode === 'signup'
              ? 'Set up your profile to start your internship tracking.'
              : 'Sign in to access your internship logs and dashboard.'}
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Authentication options">
            <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => switchMode('signup')}>
              Sign Up
            </button>
            <button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => switchMode('signin')}>
              Sign In
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === 'signup' && (
              <div className="auth-name-grid">
                <label>
                  First Name
                  <input value={form.firstName} onChange={(event) => update('firstName', event.target.value)} autoComplete="given-name" required />
                </label>
                <label>
                  Last Name
                  <input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} autoComplete="family-name" required />
                </label>
              </div>
            )}
            <label>
              Email
              <input value={form.email} type="email" onChange={(event) => update('email', event.target.value)} autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                value={form.password}
                type="password"
                onChange={(event) => update('password', event.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </label>
            {mode === 'signup' && (
              <label>
                Confirm Password
                <input
                  value={form.confirmPassword}
                  type="password"
                  onChange={(event) => update('confirmPassword', event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
            )}
            {message && <p className="auth-message">{message}</p>}
            <button className="primary-button wide" type="submit" disabled={submitting}>
              {mode === 'signup' ? <UserPlus size={17} /> : <ShieldCheck size={17} />}
              {submitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        <aside className="login-photo-panel" aria-label="Students working together">
          <div className="photo-overlay">
            <span className="eyebrow">Internship Management</span>
            <h2>Securely manage your professional development.</h2>
          </div>
        </aside>
      </section>
    </main>
  )
}