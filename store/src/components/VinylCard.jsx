import { useState } from 'react'

function extractDiscColors(imgEl) {
  try {
    const SIZE = 48
    const canvas = document.createElement('canvas')
    canvas.width = SIZE; canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgEl, 0, 0, SIZE, SIZE)
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

    const buckets = {}
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const brightness = (r + g + b) / 3
      if (brightness < 25 || brightness > 235) continue
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      if (max === 0 || (max - min) / max < 0.18) continue
      const qr = Math.round(r / 40) * 40
      const qg = Math.round(g / 40) * 40
      const qb = Math.round(b / 40) * 40
      const key = `${qr},${qg},${qb}`
      buckets[key] = (buckets[key] || 0) + 1
    }

    const sorted = Object.entries(buckets).sort(([, a], [, b]) => b - a)
    if (!sorted.length) return null

    const toRgb = key => key.split(',').map(Number)
    const diff = ([r1,g1,b1],[r2,g2,b2]) => Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2)

    const c1 = toRgb(sorted[0][0])
    let c2 = null
    for (const [key] of sorted.slice(1)) {
      if (diff(c1, toRgb(key)) > 60) { c2 = toRgb(key); break }
    }
    if (!c2) c2 = c1.map(v => Math.max(0, v - 55))

    const fmt = ([r,g,b]) => `rgb(${r},${g},${b})`
    return [fmt(c1), fmt(c2)]
  } catch {
    return null
  }
}

export default function VinylCard({ vinyl, onOpen, onAdd }) {
  const [hover,      setHover]      = useState(false)
  const [artErr,     setArtErr]     = useState(false)
  const [discColors, setDiscColors] = useState(null)

  const artSrc = `/covers/${vinyl.id}.jpg`
  const showArt = !artErr

  const handleImgLoad = (e) => {
    const colors = extractDiscColors(e.currentTarget)
    if (colors) setDiscColors(colors)
  }

  const discStyle = discColors ? {
    background: `conic-gradient(
      ${discColors[0]} 0deg,   ${discColors[1]} 20deg,
      ${discColors[0]} 40deg,  ${discColors[1]} 60deg,
      ${discColors[0]} 80deg,  ${discColors[1]} 100deg,
      ${discColors[0]} 120deg, ${discColors[1]} 140deg,
      ${discColors[0]} 160deg, ${discColors[1]} 180deg,
      ${discColors[0]} 200deg, ${discColors[1]} 220deg,
      ${discColors[0]} 240deg, ${discColors[1]} 260deg,
      ${discColors[0]} 280deg, ${discColors[1]} 300deg,
      ${discColors[0]} 320deg, ${discColors[1]} 340deg,
      ${discColors[0]} 360deg
    )`,
  } : {}

  return (
    <div
      style={{
        background: 'var(--surface)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background .2s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(vinyl)}
    >
      {/* Cover / disc area */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%',
        background: 'var(--surface2)',
        overflow: 'hidden',
      }}>
        {showArt ? (
          <>
            <img
              src={artSrc}
              alt={vinyl.title}
              onError={() => setArtErr(true)}
              onLoad={handleImgLoad}
              crossOrigin="anonymous"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform .4s ease, filter .3s',
                transform: hover ? 'scale(1.06)' : 'scale(1)',
                filter: hover ? 'brightness(.55)' : 'brightness(1)',
              }}
            />
            {/* Spinning disc overlay on hover */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hover ? 1 : 0,
              transition: 'opacity .25s',
            }}>
              <div
                className="disc"
                style={{
                  width: 76, height: 76,
                  animation: hover ? 'spin 2.5s linear infinite' : 'none',
                  boxShadow: '0 0 40px rgba(0,0,0,.9)',
                  ...discStyle,
                }}
              />
            </div>
          </>
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div
              className="disc"
              style={{
                width: 76, height: 76,
                animation: hover ? 'spin 2.5s linear infinite' : 'none',
                boxShadow: hover ? '0 0 24px rgba(232,255,71,.18)' : 'none',
                ...discStyle,
              }}
            />
          </div>
        )}

        {/* Genre badge */}
        {vinyl.genre && (
          <span style={{
            position: 'absolute',
            top: 10, left: 10,
            fontSize: '.55rem',
            letterSpacing: 1,
            textTransform: 'uppercase',
            background: 'rgba(0,0,0,.75)',
            color: 'var(--muted)',
            padding: '3px 8px',
            backdropFilter: 'blur(4px)',
          }}>
            {vinyl.genre}
          </span>
        )}

        {/* Year badge */}
        {vinyl.release_year && (
          <span style={{
            position: 'absolute',
            top: 10, right: 10,
            fontSize: '.55rem',
            letterSpacing: 1,
            background: 'rgba(0,0,0,.75)',
            color: 'var(--accent)',
            padding: '3px 8px',
            backdropFilter: 'blur(4px)',
          }}>
            {vinyl.release_year}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '.88rem', marginBottom: 3, lineHeight: 1.3, fontWeight: 400 }}>
          {vinyl.title}
        </div>
        <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 12 }}>
          {vinyl.artist}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontSize: '1rem', color: 'var(--accent)', letterSpacing: .5 }}>
            {Number(vinyl.price).toLocaleString('ru-RU')} ₽
          </span>
          <span style={{
            fontSize: '.58rem',
            color: vinyl.stock === 0 ? 'var(--accent2)' : 'var(--muted)',
            letterSpacing: 1,
          }}>
            {vinyl.stock === 0 ? 'НЕТ' : `${vinyl.stock} шт`}
          </span>
        </div>

        <button
          className="btn btn-sm"
          style={{
            marginTop: 12,
            width: '100%',
            justifyContent: 'center',
            opacity: hover ? 1 : .55,
            transform: hover ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity .2s, transform .2s, background .15s, color .15s',
          }}
          onClick={(e) => { e.stopPropagation(); onAdd(vinyl) }}
          disabled={vinyl.stock === 0}
        >
          {vinyl.stock === 0 ? 'Нет в наличии' : '+ В корзину'}
        </button>
      </div>
    </div>
  )
}
