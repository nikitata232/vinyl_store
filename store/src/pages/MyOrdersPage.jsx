import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../App'

export default function MyOrdersPage({ nav }) {
  const { user }             = useAuth()
  const [orders,  setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]  = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get('/my-orders')
      .then(async r => {
        if (!r.ok) throw new Error('Ошибка загрузки')
        setOrders(await r.json())
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32 }}>
        <h1 className="page-title">МОИ ЗАКАЗЫ</h1>
      </div>
      <div className="empty">
        <span className="empty-icon">🔒</span>
        Войди в аккаунт, чтобы видеть заказы
        <br /><br />
        <button className="btn btn-sm" onClick={() => nav('auth')}>Войти</button>
      </div>
    </div>
  )

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <h1 className="page-title">МОИ ЗАКАЗЫ</h1>
        <span className="route-badge">GET /my-orders</span>
        <span style={{ fontSize: '.65rem', color: 'var(--muted)', marginLeft: 'auto', letterSpacing: 1 }}>
          {user.username}
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--muted)', padding: '40px 0' }}>
          <span className="spinner" />
          <span style={{ fontSize: '.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>Загрузка...</span>
        </div>
      )}

      {error && (
        <div className="empty">
          <span className="empty-icon">⚠</span>
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty">
          <span className="empty-icon">📦</span>
          Заказов пока нет
          <br /><br />
          <button className="btn btn-sm" onClick={() => nav('catalog')}>Перейти в каталог</button>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {orders.map((o, idx) => (
            <div
              key={o.id}
              className="order-card"
              style={{ animation: `fadeUp .3s ease ${idx * 50}ms both` }}
            >
              {/* Order header */}
              <div className="order-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.8rem', color: 'var(--muted)', letterSpacing: 1 }}>
                    Заказ #{o.id}
                  </span>
                  {o.created_at && (
                    <span style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: .5 }}>
                      {o.created_at}
                    </span>
                  )}
                  <span style={{
                    fontSize: '.62rem',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    background: 'rgba(232,255,71,.08)',
                    padding: '3px 10px',
                    border: '1px solid rgba(232,255,71,.15)',
                  }}>
                    Выполнен
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', color: 'var(--accent)', letterSpacing: 1, flexShrink: 0 }}>
                  {Number(o.total_price).toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Order items */}
              {o.items && o.items.length > 0 && o.items.map((item, j) => (
                <div key={j} className="order-item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <img
                      src={`/covers/${item.vinyl_id}.jpg`}
                      alt={item.title}
                      onError={(e) => { e.target.style.display = 'none' }}
                      style={{
                        width: 40, height: 40,
                        objectFit: 'cover',
                        flexShrink: 0,
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '.82rem', lineHeight: 1.3 }}>{item.title}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 2 }}>
                        {item.artist}
                        {item.quantity > 1 && (
                          <span style={{ color: 'var(--accent)', marginLeft: 8 }}>× {item.quantity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '.78rem', color: 'var(--muted)', flexShrink: 0 }}>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
