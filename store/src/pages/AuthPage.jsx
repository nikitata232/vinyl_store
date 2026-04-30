import { useState } from 'react'
import { useAuth } from '../App'

export default function AuthPage({ nav }) {
  const [tab,      setTab]      = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const { login, register } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!username || !password) { setError('Заполните все поля'); return }
    setLoading(true)
    try {
      if (tab === 'login') await login(username, password)
      else                 await register(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (t) => { setTab(t); setError(null); setUsername(''); setPassword('') }

  const tabStyle = (id) => ({
    padding: '12px 28px',
    fontSize: '.7rem',
    letterSpacing: 2,
    textTransform: 'uppercase',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: tab === id ? 'var(--accent)' : 'var(--muted)',
    borderBottom: `2px solid ${tab === id ? 'var(--accent)' : 'transparent'}`,
    transition: 'all .2s',
  })

  return (
    <div className="fade-up" style={{ display: 'flex', gap: 64, alignItems: 'flex-start', justifyContent: 'center', minHeight: '60vh' }}>
      {/* Form */}
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand + disc */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div
            className="disc"
            style={{ width: 44, height: 44, animation: 'spin 14s linear infinite', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', letterSpacing: 3, color: 'var(--text)', lineHeight: 1 }}>
              VINYL<span style={{ color: 'var(--accent)' }}>STORE</span>
            </div>
            <div style={{ fontSize: '.6rem', color: 'var(--muted)', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>
              {tab === 'login' ? 'Вход в аккаунт' : 'Новый аккаунт'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          <button style={tabStyle('login')}    onClick={() => switchTab('login')}>Войти</button>
          <button style={tabStyle('register')} onClick={() => switchTab('register')}>Регистрация</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="field">
            <label className="label">Имя пользователя</label>
            <input
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label className="label">Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255,71,87,.08)',
              border: '1px solid rgba(255,71,87,.25)',
              color: 'var(--accent2)',
              fontSize: '.75rem',
              letterSpacing: .5,
              lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <button className="btn" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
            {loading && <span className="spinner" />}
            {tab === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: '.65rem', color: 'var(--muted)', letterSpacing: .5, lineHeight: 1.8 }}>
          {tab === 'login'
            ? 'Нет аккаунта? '
            : 'Уже есть аккаунт? '}
          <button
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 'inherit', letterSpacing: 'inherit', padding: 0 }}
            onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
          >
            {tab === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>

      {/* Decorative discs (hidden on mobile) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingTop: 8,
        opacity: .35,
      }}>
        {[
          { size: 140, speed: '18s', delay: '0s' },
          { size: 90,  speed: '12s', delay: '-4s' },
          { size: 60,  speed: '8s',  delay: '-2s' },
        ].map((d, i) => (
          <div
            key={i}
            className="disc"
            style={{
              width: d.size, height: d.size,
              animation: `spin ${d.speed} linear infinite`,
              animationDelay: d.delay,
            }}
          />
        ))}
      </div>
    </div>
  )
}
