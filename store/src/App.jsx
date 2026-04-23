import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { api } from './api'
import Header from './components/Header'
import Toast from './components/Toast'
import VinylDrawer from './components/VinylDrawer'
import CatalogPage from './pages/CatalogPage'
import AuthPage from './pages/AuthPage'
import CartPage from './pages/CartPage'
import MyOrdersPage from './pages/MyOrdersPage'
import RecommendPage from './pages/RecommendPage'

export const AuthCtx  = createContext(null)
export const ToastCtx = createContext(null)
export const CartCtx  = createContext(null)

export function useAuth()  { return useContext(AuthCtx) }
export function useToast() { return useContext(ToastCtx) }
export function useCart()  { return useContext(CartCtx) }

export default function App() {
  const [user,        setUser]    = useState(null)
  const [authReady,   setReady]   = useState(false)
  const [page,        setPage]    = useState('catalog')
  const [cart,        setCart]    = useState([])
  const [drawer,      setDrawer]  = useState(null)
  const [toast,       setToast]   = useState(null)

  // ── Toast ──────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // ── Auth restore on mount ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setReady(true); return }
    api.get('/me')
      .then(async r => { if (r.ok) setUser(await r.json()); else localStorage.removeItem('token') })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true))
  }, [])

  const login = async (username, password) => {
    const r    = await api.post('/auth/login', { username, password })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail || 'Ошибка входа')
    localStorage.setItem('token', data.access_token)
    const me = await (await api.get('/me')).json()
    setUser(me)
    setPage('catalog')
    showToast(`Добро пожаловать, ${me.username}!`)
  }

  const register = async (username, password) => {
    const r    = await api.post('/auth/register', { username, password })
    const data = await r.json()
    if (!r.ok) throw new Error(data.detail || 'Ошибка регистрации')
    await login(username, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCart([])
    setPage('catalog')
    showToast('Вышли из аккаунта')
  }

  // ── Cart ───────────────────────────────────────────────
  const addToCart = useCallback((vinyl) => {
    setCart(prev => {
      const existing = prev.find(i => i.vinyl_id === vinyl.id)
      if (existing) {
        showToast(`${vinyl.title} — ещё 1 добавлен`)
        return prev.map(i => i.vinyl_id === vinyl.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      showToast(`${vinyl.title} добавлен в корзину`)
      return [...prev, {
        vinyl_id: vinyl.id,
        quantity: 1,
        title:    vinyl.title,
        artist:   vinyl.artist,
        price:    vinyl.price,
        stock:    vinyl.stock,
      }]
    })
  }, [showToast])

  const updateQty = useCallback((vinyl_id, qty) => {
    if (qty < 1) return
    setCart(prev => prev.map(i => i.vinyl_id === vinyl_id ? { ...i, quantity: qty } : i))
  }, [])

  const removeFromCart = useCallback((vinyl_id) => {
    setCart(prev => prev.filter(i => i.vinyl_id !== vinyl_id))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  if (!authReady) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 }}>
      <span className="spinner" />
      <span style={{ fontSize: '.7rem', letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>
        Загрузка...
      </span>
    </div>
  )

  const nav = (p) => { setDrawer(null); setPage(p) }

  return (
    <AuthCtx.Provider value={{ user, login, register, logout }}>
      <ToastCtx.Provider value={showToast}>
        <CartCtx.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart }}>

          <Header page={page} nav={nav} cartCount={cart.length} />

          {drawer && (
            <VinylDrawer
              vinyl={drawer}
              onClose={() => setDrawer(null)}
              addToCart={addToCart}
            />
          )}

          <main style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
            {page === 'catalog'  && <CatalogPage  nav={nav} setDrawer={setDrawer} />}
            {page === 'recommend'&& <RecommendPage nav={nav} setDrawer={setDrawer} />}
            {page === 'cart'     && <CartPage      nav={nav} />}
            {page === 'orders'   && <MyOrdersPage  nav={nav} />}
            {page === 'auth'     && <AuthPage      nav={nav} />}
          </main>

          {toast && <Toast msg={toast.msg} type={toast.type} />}

        </CartCtx.Provider>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  )
}
