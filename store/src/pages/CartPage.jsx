import { useState } from 'react'
import { api } from '../api'
import { useAuth, useCart, useToast } from '../App'

export default function CartPage({ nav }) {
  const { user }                               = useAuth()
  const { cart, updateQty, removeFromCart, clearCart } = useCart()
  const showToast                              = useToast()
  const [loading, setLoading]                  = useState(false)

  const total = cart.reduce((s, i) => s + Number(i.price) * i.quantity, 0)

  const checkout = async () => {
    if (!user) { nav('auth'); return }
    setLoading(true)
    try {
      const r    = await api.post('/orders', { items: cart.map(i => ({ vinyl_id: i.vinyl_id, quantity: i.quantity })) })
      const data = await r.json()
      if (!r.ok) { showToast(data.detail || 'Ошибка заказа', 'err'); return }
      showToast(`Заказ оформлен! Итого: ${Number(data.total_price).toLocaleString('ru-RU')} ₽`)
      clearCart()
      nav('orders')
    } catch {
      showToast('Ошибка соединения', 'err')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32 }}>
        <h1 className="page-title">КОРЗИНА</h1>
      </div>
      <div className="empty">
        <span className="empty-icon">🛒</span>
        Корзина пуста — добавь пластинки из каталога
        <br /><br />
        <button className="btn btn-sm" onClick={() => nav('catalog')}>Перейти в каталог</button>
      </div>
    </div>
  )

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <h1 className="page-title">КОРЗИНА</h1>
        <span className="route-badge">POST /orders</span>
        <span style={{ fontSize: '.65rem', color: 'var(--muted)', marginLeft: 'auto', letterSpacing: 1 }}>
          {cart.length} {cart.length === 1 ? 'позиция' : 'позиций'}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={clearCart}>
          Очистить
        </button>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 28 }}>
        {cart.map((item, idx) => (
          <div
            key={item.vinyl_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 20px',
              background: 'var(--surface)',
              animation: `fadeUp .25s ease ${idx * 40}ms both`,
            }}
          >
            {/* Cover thumbnail */}
            <img
              src={`/covers/${item.vinyl_id}.jpg`}
              alt={item.title}
              onError={(e) => { e.target.style.display = 'none' }}
              style={{
                width: 52, height: 52,
                objectFit: 'cover',
                flexShrink: 0,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
              }}
            />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.9rem', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{item.artist}</div>
            </div>

            {/* Price per unit */}
            <span style={{ fontSize: '.82rem', color: 'var(--accent)', minWidth: 80, textAlign: 'right', flexShrink: 0 }}>
              {Number(item.price).toLocaleString('ru-RU')} ₽
            </span>

            {/* Qty controls */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
              <button
                onClick={() => item.quantity === 1 ? removeFromCart(item.vinyl_id) : updateQty(item.vinyl_id, item.quantity - 1)}
                style={{
                  width: 32, height: 32,
                  background: 'none', border: 'none',
                  color: 'var(--muted)', cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
              >−</button>
              <span style={{
                width: 36, textAlign: 'center',
                fontSize: '.75rem', letterSpacing: 1,
                borderLeft: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                lineHeight: '32px',
              }}>
                {item.quantity}
              </span>
              <button
                onClick={() => updateQty(item.vinyl_id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                style={{
                  width: 32, height: 32,
                  background: 'none', border: 'none',
                  color: 'var(--muted)', cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color .15s',
                  opacity: item.quantity >= item.stock ? .3 : 1,
                }}
                onMouseEnter={e => { if (item.quantity < item.stock) e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
              >+</button>
            </div>

            {/* Subtotal */}
            <span style={{ fontSize: '.8rem', color: 'var(--muted)', minWidth: 84, textAlign: 'right', flexShrink: 0 }}>
              {(Number(item.price) * item.quantity).toLocaleString('ru-RU')} ₽
            </span>
          </div>
        ))}
      </div>

      {/* Total + checkout */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 32,
        padding: '20px 0',
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '.6rem', letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Итого
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: '2.2rem', color: 'var(--accent)', letterSpacing: 1 }}>
            {total.toLocaleString('ru-RU')} ₽
          </div>
        </div>

        <button className="btn" style={{ padding: '12px 28px' }} onClick={checkout} disabled={loading}>
          {loading && <span className="spinner" />}
          {user ? 'Оформить заказ' : 'Войти и оформить'}
        </button>
      </div>
    </div>
  )
}
