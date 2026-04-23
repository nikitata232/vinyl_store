import { useState, useEffect } from 'react'

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

export default function VinylDrawer({ vinyl, onClose, addToCart }) {
  const [artErr,     setArtErr]     = useState(false)
  const [discColors, setDiscColors] = useState(null)

  useEffect(() => {
    setArtErr(false)
    setDiscColors(null)
  }, [vinyl.id])

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const artSrc = `/covers/${vinyl.id}.jpg`
  const showArt = !artErr
  const inStock = vinyl.stock > 0

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
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.65)',
          zIndex: 200,
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Drawer */}
      <aside
        className="slide-in"
        style={{
          position: 'fixed',
          top: 0, right: 0,
          width: 400,
          height: '100%',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 201,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Cover image */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: 'var(--surface2)', flexShrink: 0 }}>
          {showArt ? (
            <>
              <img
                src={artSrc}
                alt={vinyl.title}
                onError={() => setArtErr(true)}
                onLoad={handleImgLoad}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Spinning disc overlay centred on cover */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <div
                  className="disc"
                  style={{
                    width: 130, height: 130,
                    animation: 'spin 8s linear infinite',
                    boxShadow: '0 0 50px rgba(0,0,0,.7)',
                    opacity: discColors ? 1 : 0,
                    transition: 'opacity .4s',
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
                  width: 130, height: 130,
                  animation: 'spin 8s linear infinite',
                  boxShadow: '0 0 50px rgba(232,255,71,.1)',
                  ...discStyle,
                }}
              />
            </div>
          )}

          {/* Gradient overlay for readability */}
          {showArt && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,.3) 0%, rgba(0,0,0,.0) 40%, rgba(13,13,13,.9) 100%)',
              pointerEvents: 'none',
            }} />
          )}

          {/* Close + ID row */}
          <div style={{
            position: 'absolute',
            top: 14, left: 16, right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: '.58rem', letterSpacing: 2,
              textTransform: 'uppercase',
              background: 'rgba(0,0,0,.6)',
              color: 'var(--muted)',
              padding: '3px 8px',
            }}>
              ID #{vinyl.id}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(0,0,0,.5)',
                border: '1px solid rgba(255,255,255,.1)',
                color: 'var(--text)',
                width: 30, height: 30,
                cursor: 'pointer',
                fontSize: '.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
              }}
            >
              ✕
            </button>
          </div>

          {/* Title overlaid on cover */}
          {showArt && (
            <div style={{
              position: 'absolute',
              bottom: 16, left: 20, right: 20,
            }}>
              <div style={{
                fontFamily: 'var(--display)',
                fontSize: '2rem',
                lineHeight: 1,
                letterSpacing: 1,
                textShadow: '0 2px 8px rgba(0,0,0,.8)',
                marginBottom: 4,
              }}>
                {vinyl.title}
              </div>
              <div style={{ fontSize: '.75rem', color: 'rgba(240,236,228,.6)', letterSpacing: .5 }}>
                {vinyl.artist}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>

          {/* Title (when no art) */}
          {!showArt && (
            <div>
              <div style={{
                fontFamily: 'var(--display)',
                fontSize: '2.2rem',
                lineHeight: 1,
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                {vinyl.title}
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{vinyl.artist}</div>
            </div>
          )}

          {/* Details grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
          }}>
            {[
              { key: 'Жанр',      val: vinyl.genre || '—',                              accent: false },
              { key: 'Цена',      val: `${Number(vinyl.price).toLocaleString('ru-RU')} ₽`, accent: true  },
              { key: 'В наличии', val: `${vinyl.stock} шт`,                              accent: !inStock },
            ].map(({ key, val, accent }) => (
              <div key={key} style={{ background: 'var(--surface)', padding: '14px 16px' }}>
                <div style={{ fontSize: '.56rem', letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  {key}
                </div>
                <div style={{ fontSize: '.95rem', color: accent ? 'var(--accent)' : 'var(--text)' }}>
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            {inStock ? (
              <button
                className="btn"
                style={{ justifyContent: 'center' }}
                onClick={() => { addToCart(vinyl); onClose() }}
              >
                + Добавить в корзину
              </button>
            ) : (
              <button className="btn" disabled style={{ justifyContent: 'center' }}>
                Нет в наличии
              </button>
            )}
            <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
