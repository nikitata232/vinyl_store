import { useState, useEffect, useMemo } from 'react'
import { api } from '../api'
import { useCart } from '../App'
import VinylCard from '../components/VinylCard'

const SORT_OPTIONS = [
  { val: 'title',      label: 'По названию' },
  { val: 'price_asc',  label: 'Цена ↑' },
  { val: 'price_desc', label: 'Цена ↓' },
  { val: 'year_desc',  label: 'Год: новее' },
  { val: 'year_asc',   label: 'Год: старее' },
]

function applySort(arr, sortBy) {
  const a = [...arr]
  switch (sortBy) {
    case 'price_asc':  return a.sort((x, y) => x.price - y.price)
    case 'price_desc': return a.sort((x, y) => y.price - x.price)
    case 'year_desc':  return a.sort((x, y) => (y.release_year || 0) - (x.release_year || 0))
    case 'year_asc':   return a.sort((x, y) => (x.release_year || 0) - (y.release_year || 0))
    default:           return a.sort((x, y) => x.title.localeCompare(y.title))
  }
}

function SkeletonGrid() {
  return (
    <div className="vinyl-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderBottom: '1px solid var(--border)',
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div className="skeleton" style={{ paddingTop: '100%' }} />
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ height: 14, width: '75%', borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 11, width: '55%', borderRadius: 2 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <div className="skeleton" style={{ height: 14, width: '35%', borderRadius: 2 }} />
              <div className="skeleton" style={{ height: 11, width: '20%', borderRadius: 2 }} />
            </div>
            <div className="skeleton" style={{ height: 32, width: '100%', borderRadius: 2, marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CatalogPage({ setDrawer }) {
  const [vinyls,  setVinyls]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [genre,   setGenre]   = useState('')
  const [sortBy,  setSortBy]  = useState('title')

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

  const inStock = useMemo(() => vinyls.filter(v => v.stock > 0).length, [vinyls])

  const displayed = useMemo(() => {
    const filtered = vinyls.filter(v => {
      const q = search.toLowerCase()
      const matchSearch = !q || v.title.toLowerCase().includes(q) || v.artist.toLowerCase().includes(q)
      const matchGenre  = !genre || v.genre === genre
      return matchSearch && matchGenre
    })
    return applySort(filtered, sortBy)
  }, [vinyls, search, genre, sortBy])

  const hasFilter = search || genre

  return (
    <div className="fade-up">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <h1 className="page-title">КАТАЛОГ</h1>
        <span className="route-badge">GET /vinyls</span>
        {!loading && (
          <span style={{ fontSize: '.65rem', color: 'var(--muted)', marginLeft: 'auto', letterSpacing: 1 }}>
            {displayed.length} / {vinyls.length} пластинок
          </span>
        )}
      </div>

      {/* Stats bar */}
      {!loading && !error && vinyls.length > 0 && (
        <div className="stats-bar">
          {[
            { val: vinyls.length, label: 'Пластинок' },
            { val: genres.length, label: 'Жанров' },
            { val: inStock,       label: 'В наличии' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + sort */}
      {vinyls.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px' }}>
            <input
              placeholder="Поиск по названию или артисту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 0 160px' }}>
            <select value={genre} onChange={e => setGenre(e.target.value)}>
              <option value="">Все жанры</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ flex: '0 0 160px' }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
          </div>
          {hasFilter && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: 'center' }}
              onClick={() => { setSearch(''); setGenre('') }}
            >
              Сбросить
            </button>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <SkeletonGrid />}

      {/* Error */}
      {error && (
        <div className="empty">
          <span className="empty-icon">⚠</span>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && displayed.length === 0 && (
        <div className="empty">
          <span className="empty-icon">💿</span>
          {vinyls.length === 0 ? 'Пластинок нет в базе' : 'Ничего не найдено'}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && displayed.length > 0 && (
        <div className="vinyl-grid">
          {displayed.map(v => (
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
