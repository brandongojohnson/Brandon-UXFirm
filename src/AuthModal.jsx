import { useState } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from './firebase'

function friendlyError(code) {
  return ({
    'auth/user-not-found':          'No account found with that email.',
    'auth/wrong-password':          'Incorrect password.',
    'auth/invalid-credential':      'Incorrect email or password.',
    'auth/email-already-in-use':    'An account with that email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/too-many-requests':       'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user':    '',
    'auth/cancelled-popup-request': '',
  })[code] ?? 'Something went wrong. Please try again.'
}

export default function AuthModal({ onClose }) {
  const [tab, setTab]           = useState('google')
  const [emailMode, setEmailMode] = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const reset = () => { setError(''); setEmail(''); setPassword('') }

  const handleGoogle = async () => {
    setBusy(true); setError('')
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      onClose()
    } catch (e) {
      const msg = friendlyError(e.code)
      if (msg) setError(msg)
    } finally { setBusy(false) }
  }

  const handleEmail = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      if (emailMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onClose()
    } catch (e) {
      setError(friendlyError(e.code))
    } finally { setBusy(false) }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        <div className="auth-modal__header">
          <span className="auth-modal__logo">Methodic</span>
          <button className="auth-modal__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="auth-modal__tabs">
          <button
            className={`auth-tab${tab === 'google' ? ' auth-tab--active' : ''}`}
            onClick={() => { setTab('google'); reset() }}
          >
            <span className="material-symbols-outlined">account_circle</span>
            Google
          </button>
          <button
            className={`auth-tab${tab === 'email' ? ' auth-tab--active' : ''}`}
            onClick={() => { setTab('email'); reset() }}
          >
            <span className="material-symbols-outlined">mail</span>
            Email
          </button>
        </div>

        <div className="auth-modal__body">
          {tab === 'google' && (
            <>
              <p className="auth-modal__desc">
                Sign in with your Google account to access Methodic admin features.
              </p>
              <button className="auth-google-btn" onClick={handleGoogle} disabled={busy}>
                {busy ? 'Signing in…' : 'Continue with Google'}
              </button>
              {error && <p className="auth-error">{error}</p>}
            </>
          )}

          {tab === 'email' && (
            <>
              <div className="auth-mode-toggle">
                <button
                  className={`auth-mode-btn${emailMode === 'signin' ? ' auth-mode-btn--active' : ''}`}
                  onClick={() => { setEmailMode('signin'); reset() }}
                >Sign In</button>
                <button
                  className={`auth-mode-btn${emailMode === 'signup' ? ' auth-mode-btn--active' : ''}`}
                  onClick={() => { setEmailMode('signup'); reset() }}
                >Create Account</button>
              </div>
              <form className="auth-form" onSubmit={handleEmail}>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    type="email" className="auth-input" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input
                    type="password" className="auth-input" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required minLength={6}
                    autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-submit" disabled={busy}>
                  {busy ? 'Please wait…' : emailMode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
