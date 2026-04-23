import { useState, useEffect, useMemo } from 'react'
import { api } from '../api'
import { useCart } from '../App'
import VinylCard from '../components/VinylCard'

export default function CatalogPage({ setDrawer }) {
  const [vinyls,  setVinyls]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [genre,   setGenre]   = useState('')

  const { addToCart } = useCart()

  useEffect(() => {
    api.get('/vinyls')
      .then(async r => {
        if (!r.ok) throw new Error('Ошибка загрузки')
        setVinyls(await r.json())
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const genres = useMemo(() =>
    [...new Set(vinyls.map(v => v.genre).filter(Boolean))].sort(),
    [vinyls]
  )

  const filtered = useMemo(() =>
    vinyls.filter(v => {
      const q = search.toLowerCase()
      const matchSearch = !q || v.title.toLowerCase().includes(q) || v.artist.toLowerCase().includes(q)
      const matchGenre  = !genre || v.genre === genre
      return matchSearch && matchGenre
    }),
    [vinyls, search, genre]
  )

  return (
    <div className="fade-up">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <h1 className="page-title">КАТАЛОГ</h1>
        <span className="route-badge">GET /vinyls</span>
        {!loading && (
          <span style={{ fontSize: '.65rem', color: 'var(--muted)', marginLeft: 'auto', letterSpacing: 1 }}>
            {filtered.length} / {vinyls.length} пластинок
          </span>
        )}
      </div>

      {/* Filters */}
      {vinyls.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <input
              placeholder="Поиск по названию или артисту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 0 180px' }}>
            <select value={genre} onChange={e => setGenre(e.target.value)}>
              <option value="">Все жанры</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {(search || genre) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); setGenre('') }}
            >
              Сбросить
            </button>
          )}
        </div>
      )}

      {/* States */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '60px 0', color: 'var(--muted)' }}>
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

      {!loading && !error && filtered.length === 0 && (
        <div className="empty">
          <span className="empty-icon">💿</span>
          {vinyls.length === 0 ? 'Пластинок нет в базе' : 'Ничего не найдено'}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          borderTop: '1px solid var(--border)',
          borderLeft: '1px solid var(--border)',
        }}>
          {filtered.map(v => (
            <VinylCard
              key={v.id}
              vinyl={v}
              onOpen={setDrawer}
              onAdd={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
