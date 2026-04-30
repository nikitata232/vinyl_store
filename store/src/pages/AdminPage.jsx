import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { useToast } from '../App'

const TABS = [
  { id: 'orders',  label: 'Все заказы' },
  { id: 'vinyls',  label: 'Пластинки' },
  { id: 'users',   label: 'Пользователи' },
]

const S = {
  tab: {
    padding: '8px 20px',
    fontSize: '.68rem',
    letterSpacing: 2,
    textTransform: 'uppercase',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--muted)',
    cursor: 'pointer',
    transition: 'color .2s, border-color .2s',
  },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    fontSize: '.62rem',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'var(--muted)',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    fontSize: '.58rem',
    letterSpacing: 1,
    textTransform: 'uppercase',
    padding: '3px 8px',
    border: '1px solid rgba(232,255,71,.2)',
    color: 'var(--accent)',
    background: 'rgba(232,255,71,.06)',
  },
  input: { width: '100%' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  formFull: { gridColumn: '1 / -1' },
  modal: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: 32,
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflowY: 'auto',
  },
}

// ── Orders Tab ────────────────────────────────────────
function OrdersTab() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(null)

  useEffect(() => {
    api.get('/admin/orders')
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1 }}>
          {orders.length} заказов
        </span>
      </div>

      {orders.length === 0
        ? <Empty icon="📦" text="Заказов нет" />
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['#', 'Пользователь', 'Дата', 'Сумма', 'Позиций', ''].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={S.td}><span style={S.badge}>#{o.id}</span></td>
                    <td style={S.td}>{o.user}</td>
                    <td style={S.td} sx={{ whiteSpace: 'nowrap' }}>{o.created_at}</td>
                    <td style={{ ...S.td, fontFamily: 'var(--display)', color: 'var(--accent)' }}>
                      {Number(o.total_price).toLocaleString('ru-RU')} ₽
                    </td>
                    <td style={S.td}>{o.items.length}</td>
                    <td style={S.td}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o)}>
                        Детали
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {open && (
        <div style={S.modal} onClick={() => setOpen(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: '.8rem', color: 'var(--muted)', letterSpacing: 1 }}>
                Заказ #{open.id} · {open.user} · {open.created_at}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>✕</button>
            </div>
            {open.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '.82rem' }}>{item.title}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 3 }}>
                    {item.artist}{item.quantity > 1 ? ` × ${item.quantity}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, fontFamily: 'var(--display)', fontSize: '1.4rem', color: 'var(--accent)' }}>
              {Number(open.total_price).toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Vinyl Form Modal ──────────────────────────────────
function VinylModal({ vinyl, onClose, onSave }) {
  const showToast = useToast()
  const [form, setForm] = useState({
    title:        vinyl?.title        ?? '',
    artist:       vinyl?.artist       ?? '',
    genre:        vinyl?.genre        ?? '',
    price:        vinyl?.price        ?? '',
    stock:        vinyl?.stock        ?? 0,
    release_year: vinyl?.release_year ?? new Date().getFullYear(),
    cover_image:  vinyl?.cover_image  ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = vinyl
        ? await api.put(`/admin/vinyls/${vinyl.id}`, form)
        : await api.post('/admin/vinyls', form)
      if (!r.ok) {
        const err = await r.json()
        throw new Error(JSON.stringify(err))
      }
      const saved = await r.json()
      onSave(saved, !!vinyl)
      showToast(vinyl ? 'Пластинка обновлена' : 'Пластинка добавлена')
      onClose()
    } catch (e) {
      showToast(e.message, 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="page-title" style={{ fontSize: '1rem', marginBottom: 0 }}>
            {vinyl ? 'Редактировать' : 'Добавить пластинку'}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={S.formGrid}>
          <div>
            <label style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Название</label>
            <input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Название альбома" />
          </div>
          <div>
            <label style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Исполнитель</label>
            <input style={S.input} value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="Имя артиста" />
          </div>
          <div>
            <label style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Жанр</label>
            <input style={S.input} value={form.genre} onChange={e => set('genre', e.target.value)} placeholder="Жанр" />
          </div>
          <div>
            <label style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Цена (₽)</label>
            <input style={S.input} type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="1990" />
          </div>
          <div>
            <label style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Остаток (шт.)</label>
            <input style={S.input} type="number" min="0" value={form.stock} onChange={e => set('stock', Number(e.target.value))} />
          </div>
          <div>
            <label style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Год выпуска</label>
            <input style={S.input} type="number" min="1900" max="2100" value={form.release_year} onChange={e => set('release_year', Number(e.target.value))} />
          </div>
          <div style={S.formFull}>
            <label style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>URL обложки</label>
            <input style={S.input} value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Отмена</button>
          <button className="btn btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Vinyls Tab ────────────────────────────────────────
function VinylsTab() {
  const showToast            = useToast()
  const [vinyls,  setVinyls] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]  = useState(null) // null | 'add' | vinyl object
  const [search,  setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/vinyls')
      .then(r => r.json())
      .then(setVinyls)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = (saved, isEdit) => {
    setVinyls(prev =>
      isEdit
        ? prev.map(v => v.id === saved.id ? saved : v)
        : [saved, ...prev]
    )
  }

  const handleDelete = async (vinyl) => {
    if (!window.confirm(`Удалить «${vinyl.title}»?`)) return
    const r = await api.delete(`/admin/vinyls/${vinyl.id}`)
    if (r.ok) {
      setVinyls(prev => prev.filter(v => v.id !== vinyl.id))
      showToast(`«${vinyl.title}» удалена`)
    } else {
      showToast('Ошибка удаления', 'err')
    }
  }

  const displayed = vinyls.filter(v => {
    const q = search.toLowerCase()
    return !q || v.title.toLowerCase().includes(q) || v.artist.toLowerCase().includes(q)
  })

  if (loading) return <Spinner />

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          style={{ flex: '1 1 220px' }}
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-sm" style={{ flexShrink: 0 }} onClick={() => setModal('add')}>
          + Добавить
        </button>
        <span style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1 }}>
          {displayed.length} / {vinyls.length}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['#', 'Название', 'Исполнитель', 'Жанр', 'Цена', 'Остаток', ''].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map(v => (
              <tr key={v.id}>
                <td style={{ ...S.td, color: 'var(--muted)', fontSize: '.65rem' }}>{v.id}</td>
                <td style={S.td}>{v.title}</td>
                <td style={{ ...S.td, color: 'var(--muted)' }}>{v.artist}</td>
                <td style={{ ...S.td, color: 'var(--muted)' }}>{v.genre || '—'}</td>
                <td style={{ ...S.td, fontFamily: 'var(--mono)' }}>
                  {Number(v.price).toLocaleString('ru-RU')} ₽
                </td>
                <td style={{ ...S.td, color: v.stock === 0 ? '#e84545' : 'var(--text)' }}>
                  {v.stock}
                </td>
                <td style={{ ...S.td, display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(v)}>Изм.</button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#e84545' }}
                    onClick={() => handleDelete(v)}
                  >
                    Удал.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <VinylModal
          vinyl={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}

// ── Users Tab ─────────────────────────────────────────
function UsersTab() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/users')
      .then(r => r.json())
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1 }}>
          {users.length} пользователей
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['#', 'Имя пользователя', 'Роль', 'Заказов', 'Дата регистрации'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ ...S.td, color: 'var(--muted)', fontSize: '.65rem' }}>{u.id}</td>
                <td style={S.td}>{u.username}</td>
                <td style={S.td}>
                  {u.is_admin
                    ? <span style={S.badge}>Admin</span>
                    : <span style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: 1 }}>User</span>
                  }
                </td>
                <td style={S.td}>{u.orders}</td>
                <td style={{ ...S.td, color: 'var(--muted)', fontSize: '.75rem' }}>{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--muted)', padding: '40px 0' }}>
      <span className="spinner" />
      <span style={{ fontSize: '.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>Загрузка...</span>
    </div>
  )
}

function Empty({ icon, text }) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      {text}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState('orders')

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <h1 className="page-title">ПАНЕЛЬ АДМИНИСТРАТОРА</h1>
        <span className="route-badge">ADMIN</span>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28, gap: 4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersTab />}
      {tab === 'vinyls' && <VinylsTab />}
      {tab === 'users'  && <UsersTab />}
    </div>
  )
}
