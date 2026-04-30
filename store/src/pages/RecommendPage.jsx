import { useState, useEffect } from 'react'
import { api } from '../api'
import { useCart } from '../App'
import VinylCard from '../components/VinylCard'

export default function RecommendPage({ setDrawer }) {
  const [genres,      setGenres]      = useState([])
  const [artists,     setArtists]     = useState([])
  const [genre,       setGenre]       = useState('')
  const [artist,      setArtist]      = useState('')
  const [maxPrice,    setMaxPrice]    = useState('')
  const [results,     setResults]     = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [metaLoading, setMetaLoading] = useState(true)
  const [modelOk,     setModelOk]     = useState(true)

  const { addToCart } = useCart()

  useEffect(() => {
    Promise.all([
      api.get('/recommend/genres').then(r => r.json()),
      api.get('/recommend/artists').then(r => r.json()),
    ])
      .then(([g, a]) => {
        if (g.detail || a.detail) { setModelOk(false); return }
        setGenres(g.genres   || [])
        setArtists(a.artists || [])
      })
      .catch(() => setModelOk(false))
      .finally(() => setMetaLoading(false))
  }, [])

  const search = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResults(null)
    try {
      const payload = {}
      if (genre)    payload.genre     = genre
      if (artist)   payload.artist    = artist
      if (maxPrice) payload.max_price = Number(maxPrice)

      const r    = await api.post('/recommend', payload)
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail || 'Ошибка')
      setResults(data.recommendations || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setGenre(''); setArtist(''); setMaxPrice(''); setResults(null)
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <h1 className="page-title">ПОДОБРАТЬ</h1>
        <span className="route-badge">POST /recommend</span>
      </div>

      {/* ML info card */}
      {!metaLoading && (
        <div className="ml-info">
          <div
            className="disc"
            style={{ width: 36, height: 36, flexShrink: 0, animation: 'spin 12s linear infinite' }}
          />
          <div>
            <div className="ml-info-title">
              {modelOk
                ? `KNN · 5 соседей · Евклидово расстояние · ${genres.length} жанров`
                : 'Модель загружается...'}
            </div>
            <div className="ml-info-text">
              {modelOk
                ? 'Нейросеть подбирает пластинки по жанру, артисту и цене. Все параметры опциональны.'
                : 'ML-модель ещё не готова. Попробуйте обновить страницу через несколько секунд.'}
            </div>
          </div>
        </div>
      )}

      {/* Filter form */}
      <form onSubmit={search} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520, marginBottom: 44 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label className="label">Жанр</label>
            <select value={genre} onChange={e => setGenre(e.target.value)} disabled={metaLoading || !modelOk}>
              <option value="">Любой</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="label">Артист</label>
            <select value={artist} onChange={e => setArtist(e.target.value)} disabled={metaLoading || !modelOk}>
              <option value="">Любой</option>
              {artists.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="label">Макс. цена (₽)</label>
          <input
            type="number"
            placeholder="Без ограничений"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            min={1}
            disabled={!modelOk}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" type="submit" disabled={loading || metaLoading || !modelOk}>
            {loading ? <><span className="spinner" /> Поиск...</> : 'Найти'}
          </button>
          {(genre || artist || maxPrice) && (
            <button className="btn btn-ghost" type="button" onClick={reset}>
              Сбросить
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {results !== null && (
        <div className="fade-up">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: '1.8rem', letterSpacing: 1 }}>
              РЕЗУЛЬТАТЫ
            </span>
            <span style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1 }}>
              {results.length} пластинок
            </span>
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">🔍</span>
              Ничего не найдено — попробуй другие параметры
            </div>
          ) : (
            <div className="vinyl-grid">
              {results.map(v => (
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
      )}
    </div>
  )
}
