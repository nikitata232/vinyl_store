import { useState, useEffect } from 'react'
import { useAuth, useCart } from '../App'
import { api } from '../api'

const S = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 40px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'rgba(13,13,13,.9)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    zIndex: 100,
    gap: 24,
  },
  logo: {
    fontFamily: 'var(--display)',
    fontSize: '1.9rem',
    letterSpacing: 3,
    color: 'var(--accent)',
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: 1,
    userSelect: 'none',
  },
  logoSpan: { color: 'var(--text)', opacity: .7 },
  nav: { display: 'flex', flex: 1, justifyContent: 'center' },
  tab: {
    padding: '12px 20px',
    fontSize: '.68rem',
    letterSpacing: 2,
    textTransform: 'uppercase',
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'color .2s, border-color .2s',
    whiteSpace: 'nowrap',
  },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  right: { display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 },
  status: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: '.6rem', color: 'var(--muted)', letterSpacing: 1,
  },
  user: {
    fontSize: '.67rem', color: 'var(--muted)',
    letterSpacing: 1, textTransform: 'uppercase',
    background: 'var(--surface2)',
    padding: '4px 10px',
    border: '1px solid var(--border)',
  },
  cartBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 17, height: 17,
    fontSize: '.58rem',
    background: 'var(--accent)',
    color: 'var(--bg)',
    borderRadius: '50%',
    marginLeft: 5,
    fontFamily: 'var(--mono)',
    flexShrink: 0,
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
    ...(user?.is_admin ? [{ id: 'admin', label: 'Админ' }] : []),
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
          <span>{online === null ? 'CONNECTING' : online ? 'ONLINE' : 'OFFLINE'}</span>
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
