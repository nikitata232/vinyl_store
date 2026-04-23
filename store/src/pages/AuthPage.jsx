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
    <div className="fade-up" style={{ maxWidth: 420 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32 }}>
        <h1 className="page-title">{tab === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}</h1>
        <span className="route-badge">
          {tab === 'login' ? 'POST /auth/login' : 'POST /auth/register'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <button style={tabStyle('login')}    onClick={() => { setTab('login');    setError(null) }}>Войти</button>
        <button style={tabStyle('register')} onClick={() => { setTab('register'); setError(null) }}>Регистрация</button>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="field">
          <label className="label">Имя пользователя</label>
          <input
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="label">Пароль</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255,71,87,.1)',
            border: '1px solid rgba(255,71,87,.3)',
            color: 'var(--accent2)',
            fontSize: '.75rem',
            letterSpacing: .5,
          }}>
            {error}
          </div>
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {tab === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
    </div>
  )
}
