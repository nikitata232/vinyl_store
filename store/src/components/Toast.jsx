import { useEffect, useState } from 'react'

export default function Toast({ msg, type }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const bg   = type === 'err' ? 'var(--accent2)' : 'var(--accent)'
  const color = type === 'err' ? '#fff' : 'var(--bg)'

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      padding: '12px 22px',
      background: bg,
      color,
      fontSize: '.72rem',
      letterSpacing: 1,
      fontFamily: 'var(--mono)',
      zIndex: 9999,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all .3s',
      pointerEvents: 'none',
      maxWidth: 320,
    }}>
      {msg}
    </div>
  )
}
