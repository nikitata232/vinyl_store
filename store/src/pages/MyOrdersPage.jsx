import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../App'

export default function MyOrdersPage({ nav }) {
  const { user }                    = useAuth()
  const [orders,  setOrders]        = useState([])
  const [loading, setLoading]       = useState(true)
  const [error,   setError]         = useState(null)

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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
          {/* Table head */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr auto',
            padding: '10px 20px',
            background: 'var(--surface2)',
            fontSize: '.6rem',
            letterSpacing: 2,
            color: 'var(--muted)',
            textTransform: 'uppercase',
          }}>
            <span>Заказ</span>
            <span>Статус</span>
            <span>Сумма</span>
          </div>

          {orders.map((o, idx) => (
            <div
              key={o.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr auto',
                alignItems: 'center',
                padding: '18px 20px',
                background: 'var(--surface)',
                animation: `fadeUp .3s ease ${idx * 40}ms both`,
              }}
            >
              <span style={{ fontSize: '.75rem', color: 'var(--muted)', letterSpacing: 1 }}>
                #{o.id}
              </span>
              <span style={{
                fontSize: '.65rem',
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'var(--accent)',
                background: 'rgba(232,255,71,.08)',
                padding: '4px 10px',
                display: 'inline-block',
                width: 'fit-content',
              }}>
                Выполнен
              </span>
              <span style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--accent)', letterSpacing: 1 }}>
                {Number(o.total_price).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
