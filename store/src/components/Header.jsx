import { useState, useEffect } from 'react'
import { useAuth, useCart } from '../App'
import { api } from '../api'

const S = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 40px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'var(--bg)',
    zIndex: 100,
    gap: 24,
  },
  logo: {
    fontFamily: 'var(--display)',
    fontSize: '2rem',
    letterSpacing: 2,
    color: 'var(--accent)',
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: 1,
  },
  logoSpan: { color: 'var(--text)' },
  nav: { display: 'flex', flex: 1, justifyContent: 'center' },
  tab: {
    padding: '14px 24px',
    fontSize: '.7rem',
    letterSpacing: 2,
    textTransform: 'uppercase',
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'color .2s, border-color .2s',
  },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  right: { display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 },
  status: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1 },
  user: { fontSize: '.68rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' },
  cartBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18, height: 18,
    fontSize: '.6rem',
    background: 'var(--accent)',
    color: 'var(--bg)',
    borderRadius: '50%',
    marginLeft: 4,
    fontFamily: 'var(--mono)',
  },
}

export default function Header({ page, nav, cartCount }) {
  const { user, logout } = useAuth()
  const [online, setOnline] = useState(null)

  useEffect(() => {
    const check = () =>
      api.get('/vinyls')
        .then(r => setOnline(r.ok))
        .catch(() => setOnline(false))
    check()
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [])

  const tabs = [
    { id: 'catalog',   label: 'Каталог' },
    { id: 'recommend', label: 'Подобрать' },
    { id: 'cart',      label: 'Корзина', badge: cartCount || null },
    ...(user ? [{ id: 'orders', label: 'Заказы' }] : []),
  ]

  return (
    <header style={S.header}>
      <div style={S.logo} onClick={() => nav('catalog')}>
        VINYL<span style={S.logoSpan}>STORE</span>
      </div>

      <nav style={S.nav}>
        {tabs.map(t => (
          <button
            key={t.id}
            style={{ ...S.tab, ...(page === t.id ? S.tabActive : {}) }}
            onClick={() => nav(t.id)}
          >
            {t.label}
            {t.badge ? <span style={S.cartBadge}>{t.badge}</span> : null}
          </button>
        ))}
      </nav>

      <div style={S.right}>
        <div style={S.status}>
          <span className={`dot ${online === true ? 'ok' : ''}`} />
          <span>{online === null ? 'CONNECTING' : online ? 'API ONLINE' : 'API OFFLINE'}</span>
        </div>

        {user ? (
          <>
            <span style={S.user}>
              {user.username}{user.is_admin ? ' · ADMIN' : ''}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Выйти</button>
          </>
        ) : (
          <button className="btn btn-sm" onClick={() => nav('auth')}>Войти</button>
        )}
      </div>
    </header>
  )
}
