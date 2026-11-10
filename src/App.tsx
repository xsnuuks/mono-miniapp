import { useState, useEffect, useRef } from 'react'

const API_URL = 'https://web-production-8afa.up.railway.app'
const ADMIN_ID = 7875371978

type Product = {
  id: number
  name: string
  volume: string
  strength: string
  price: number
  available: boolean
  description?: string
  photo?: string | null
}

type CartItem = { product: Product; quantity: number }

type Screen =
  | 'catalog' | 'product' | 'cart' | 'checkout' | 'success'
  | 'profile' | 'rules' | 'info'
  | 'admin' | 'admin_orders' | 'admin_products' | 'admin_product_edit'
  | 'admin_users' | 'admin_write' | 'admin_broadcast' | 'admin_stats' | 'support' | 'admin_chats' | 'admin_chat' | 'favorites'

const CITIES = ['Reutlingen', 'Pfullingen', 'Eningen', 'Betzingen']
const PAYMENTS = ['Наличные', 'Банковский перевод']

const card = {
  background: 'rgba(8,8,8,0.82)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: 16,
}

const backBtn = {
  background: 'rgba(0,0,0,0.78)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#f0f0f0',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 16,
  cursor: 'pointer',
  padding: '10px 14px',
}

const btnMain = {
  width: '100%',
  padding: 14,
  background: 'rgba(255,255,255,0.12)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}

const inputStyle = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: '#fff',
  fontSize: 15,
  outline: 'none',
}

const page = {
  padding: '20px 16px 100px',
  background: 'rgba(0,0,0,0.4)',
  minHeight: '100vh',
  color: '#f2f2f2',
  fontFamily: '"Montserrat", system-ui, sans-serif',
  fontSize: 15,
  fontWeight: 500,
  animation: 'fadeIn 0.35s ease',
}

const title = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 16,
  fontFamily: '"Montserrat", system-ui, sans-serif',
  letterSpacing: '0.02em',
}

function adminHeaders(userId?: number) {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Id': String(userId || ''),
  }
}

function photoUrl(photo?: string | null) {
  if (!photo) return null
  if (photo.startsWith('http')) return photo
  return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`
}

function IconCatalog({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#8a8a8a'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" stroke={c} strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="8" stroke={c} strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" stroke={c} strokeWidth="1.6" />
      <rect x="13" y="13" width="8" height="8" stroke={c} strokeWidth="1.6" />
    </svg>
  )
}
function IconCart({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#8a8a8a'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 6h15l-1.5 9h-12z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.3" fill={c} />
      <circle cx="17" cy="20" r="1.3" fill={c} />
      <path d="M6 6L5 3H2" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconUser({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#8a8a8a'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="1.6" />
      <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconAdmin({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#8a8a8a'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function IconInfo(props: any) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

function App() {
  const [screen, setScreen] = useState<Screen>('catalog')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [toast, setToast] = useState('')
  const [city, setCity] = useState('')
  const [place, setPlace] = useState('')
  const [payment, setPayment] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [usersPage, setUsersPage] = useState(0)
  const [usersTotal, setUsersTotal] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [statsPeriod, setStatsPeriod] = useState<'today' | '7d' | '30d' | 'all'>('all')
  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: any[] } | null>(null)
  const [writeUserId, setWriteUserId] = useState<number | null>(null)
  const [writeText, setWriteText] = useState('')
  const [editProduct, setEditProduct] = useState<Partial<Product> & { id?: number }>({})
  const [isNewProduct, setIsNewProduct] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [supportMessages, setSupportMessages] = useState<any[]>([])
  const [supportText, setSupportText] = useState('')
  const [chats, setChats] = useState<any[]>([])
  const [chatUserId, setChatUserId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatReply, setChatReply] = useState('')
  const [favIds, setFavIds] = useState<number[]>([])
  const [favProducts, setFavProducts] = useState<Product[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  const IS_ADMIN = tgUser?.id === ADMIN_ID
  const selected = products.find((p) => p.id === selectedId)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((s, i) => s + (profile?.has_discount ? 10 : i.product.price) * i.quantity, 0)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }

  async function loadProducts() {
    try {
      const r = await fetch(`${API_URL}/products`)
      const data = await r.json()
      setProducts(
        (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          volume: p.volume || '30ML',
          strength: p.strength || '50MG',
          price: Number(p.price) || 15,
          available: !!p.available,
          description: p.description || '',
          photo: p.photo || null,
        }))
      )
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function loadFavIds() {
  if (!tgUser?.id) return
  try {
    const r = await fetch(`${API_URL}/favorites/${tgUser.id}/ids`)
    if (r.ok) setFavIds(await r.json())
  } catch {}
}

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#0a0a0a')
      tg.setBackgroundColor('#0a0a0a')
    }
    loadProducts()
    loadFavIds()
    if (tgUser?.id) {
      fetch(`${API_URL}/profile/${tgUser.id}`)
        .then((r) => r.json())
        .then((d) => setProfile(d))
        .catch(() => {})
    }
  }, [])

  function addToCart(product: Product) {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id)
      if (ex) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
      return [...prev, { product, quantity: 1 }]
    })
    showToast('Товар добавлен в корзину')
  }

  function changeQty(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  async function submitOrder() {
    if (!city || !payment || cart.length === 0 || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: tgUser?.id || 0,
          username: tgUser?.username || null,
          full_name: tgUser?.first_name || null,
          city,
          place,
          payment,
          items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        }),
      })
      if (!res.ok) throw new Error('fail')
      setCart([])
      setCity('')
      setPlace('')
      setPayment('')
            if (tgUser?.id) {
        fetch(`${API_URL}/profile/${tgUser.id}`)
          .then((r) => r.json())
          .then((d) => setProfile(d))
          .catch(() => {})
      }
      setScreen('success')
    } catch {
      showToast('Не удалось отправить заказ')
    } finally {
      setSubmitting(false)
    }
  }

  async function loadOrders() {
    const r = await fetch(`${API_URL}/admin/orders`, { headers: adminHeaders(tgUser?.id) })
    if (r.ok) setOrders(await r.json())
  }

  async function setOrderStatus(id: number, status: string) {
    await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: 'POST',
      headers: adminHeaders(tgUser?.id),
      body: JSON.stringify({ status }),
    })
    await loadOrders()
  }
async function deleteOrder(orderId: number) {
  if (!confirm('Удалить заказ? Он пропадёт из статистики.')) return
  try {
    const r = await fetch(`${API_URL}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: adminHeaders(tgUser?.id),
    })
    if (!r.ok) throw new Error('Ошибка удаления')
    await loadOrders()
  } catch (e) {
    alert('Не удалось удалить заказ')
  }
}

  async function loadUsers(page = 0) {
    const r = await fetch(`${API_URL}/admin/users?page=${page}`, { headers: adminHeaders(tgUser?.id) })
    if (r.ok) {
      const data = await r.json()
      setUsers(data.users || [])
      setUsersTotal(data.total || 0)
      setUsersPage(data.page || 0)
    }
  }

  async function toggleBlock(userId: number, blocked: boolean) {
    await fetch(`${API_URL}/admin/users/${userId}/block`, {
      method: 'POST',
      headers: adminHeaders(tgUser?.id),
      body: JSON.stringify({ blocked }),
    })
    await loadUsers(usersPage)
  }

  async function sendWrite() {
    if (!writeUserId || !writeText.trim()) return
    const r = await fetch(`${API_URL}/admin/users/${writeUserId}/message`, {
      method: 'POST',
      headers: adminHeaders(tgUser?.id),
      body: JSON.stringify({ text: writeText.trim() }),
    })
    if (r.ok) {
      showToast('Сообщение отправлено')
      setWriteText('')
      setScreen('admin_users')
    } else showToast('Не удалось отправить')
  }

  async function sendBroadcast() {
    if (!broadcastText.trim()) return
    setSubmitting(true)
    try {
      const r = await fetch(`${API_URL}/admin/broadcast`, {
        method: 'POST',
        headers: adminHeaders(tgUser?.id),
        body: JSON.stringify({ text: broadcastText.trim() }),
      })
      const data = await r.json()
      setBroadcastResult({ sent: data.sent || 0, failed: data.failed || [] })
    } catch {
      showToast('Ошибка рассылки')
    } finally {
      setSubmitting(false)
    }
  }

  async function loadStats(period: 'today' | '7d' | '30d' | 'all' = statsPeriod) {
  const r = await fetch(`${API_URL}/admin/stats?period=${period}`, {
    headers: adminHeaders(tgUser?.id),
  })
  if (r.ok) setStats(await r.json())
}

  async function loadFavorites() {
    if (!tgUser?.id) return
    try {
      const r = await fetch(`${API_URL}/favorites/${tgUser.id}`)
      if (r.ok) setFavProducts(await r.json())
    } catch {}
  }

    async function toggleFav(productId: number) {
    if (!tgUser?.id) return
    const isFav = favIds.includes(productId)
    try {
      if (isFav) {
        await fetch(`${API_URL}/favorites/${tgUser.id}/${productId}`, { method: 'DELETE' })
        setFavIds((prev) => prev.filter((id) => id !== productId))
        setFavProducts((prev) => prev.filter((p) => p.id !== productId))
        showToast('Убрано из избранного')
      } else {
        await fetch(`${API_URL}/favorites/${tgUser.id}/${productId}`, { method: 'POST' })
        setFavIds((prev) => [...prev, productId])
        showToast('В избранном')
      }
    } catch {
      showToast('Не удалось')
    }
  }
  async function loadSupportMessages() {
    if (!tgUser?.id) return
    try {
      const r = await fetch(`${API_URL}/support/messages/${tgUser.id}`)
      if (r.ok) setSupportMessages(await r.json())
    } catch {}
  }

  async function sendSupport() {
    if (!tgUser?.id || !supportText.trim() || submitting) return
    setSubmitting(true)
    try {
      const r = await fetch(`${API_URL}/support/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: tgUser.id, text: supportText.trim() }),
      })
      if (!r.ok) throw new Error('fail')
      setSupportText('')
      await loadSupportMessages()
    } catch {
      showToast('Не удалось отправить')
    } finally {
      setSubmitting(false)
    }
  }

  async function loadChats() {
    const r = await fetch(`${API_URL}/admin/chats`, { headers: adminHeaders(tgUser?.id) })
    if (r.ok) setChats(await r.json())
  }

  async function openChat(userId: number) {
    setChatUserId(userId)
    const r = await fetch(`${API_URL}/admin/chats/${userId}`, { headers: adminHeaders(tgUser?.id) })
    if (r.ok) setChatMessages(await r.json())
    setScreen('admin_chat')
  }

  async function sendChatReply() {
    if (!chatUserId || !chatReply.trim() || submitting) return
    setSubmitting(true)
    try {
      const r = await fetch(`${API_URL}/admin/chats/${chatUserId}/reply`, {
        method: 'POST',
        headers: adminHeaders(tgUser?.id),
        body: JSON.stringify({ text: chatReply.trim() }),
      })
      if (!r.ok) throw new Error('fail')
      setChatReply('')
      const r2 = await fetch(`${API_URL}/admin/chats/${chatUserId}`, { headers: adminHeaders(tgUser?.id) })
      if (r2.ok) setChatMessages(await r2.json())
    } catch {
      showToast('Не удалось отправить')
    } finally {
      setSubmitting(false)
    }
  }

  async function uploadPhoto(productId: number, file: File) {
    const fd = new FormData()
    fd.append('file', file)
    await fetch(`${API_URL}/admin/products/${productId}/photo`, {
      method: 'POST',
      headers: { 'X-Admin-Id': String(tgUser?.id || '') },
      body: fd,
    })
  }

  async function saveProduct() {
    if (!editProduct.name?.trim()) {
      showToast('Укажите название')
      return
    }
    setSubmitting(true)
    try {
      if (isNewProduct) {
        const r = await fetch(`${API_URL}/admin/products`, {
          method: 'POST',
          headers: adminHeaders(tgUser?.id),
          body: JSON.stringify({
            name: editProduct.name,
            price: Number(editProduct.price) || 15,
            volume: editProduct.volume || '30ML',
            strength: editProduct.strength || '50MG',
            description: editProduct.description || '',
            is_available: editProduct.available !== false,
          }),
        })
        const data = await r.json()
        if (data.id && fileRef.current?.files?.[0]) {
          await uploadPhoto(data.id, fileRef.current.files[0])
        }
      } else if (editProduct.id) {
        await fetch(`${API_URL}/admin/products/${editProduct.id}`, {
          method: 'POST',
          headers: adminHeaders(tgUser?.id),
          body: JSON.stringify({
            name: editProduct.name,
            price: Number(editProduct.price) || 15,
            volume: editProduct.volume || '30ML',
            strength: editProduct.strength || '50MG',
            description: editProduct.description || '',
            is_available: editProduct.available !== false,
          }),
        })
        if (fileRef.current?.files?.[0]) {
          await uploadPhoto(editProduct.id, fileRef.current.files[0])
        }
      }
      await loadProducts()
      setScreen('admin_products')
      showToast('Сохранено')
    } catch {
      showToast('Ошибка сохранения')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('Удалить товар?')) return
    await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(tgUser?.id),
    })
    await loadProducts()
    setScreen('admin_products')
    showToast('Удалено')
  }

  function BottomNav() {
    if (
      [
        'product', 'checkout', 'success',
        'admin_orders', 'admin_products', 'admin_product_edit',
        'admin_users', 'admin_write', 'admin_broadcast', 'admin_stats', 'support', 'admin_chats', 'admin_chat', 'favorites'
      ].includes(screen)
    ) {
      return null
    }
      const items = [
    { id: 'catalog' as Screen, label: 'Каталог', icon: IconCatalog },
    { id: 'cart' as Screen, label: cartCount > 0 ? `Корзина ${cartCount}` : 'Корзина', icon: IconCart },
    { id: 'info' as Screen, label: 'Инфо', icon: IconInfo },
    { id: 'profile' as Screen, label: 'Профиль', icon: IconUser },
    ...(IS_ADMIN ? [{ id: 'admin' as Screen, label: 'Админ', icon: IconAdmin }] : []),
  ]
     return (
    <nav style={{
      position: 'fixed',
      left: 12,
      right: 12,
      bottom: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      gap: 4,
      background: '#1a1a1a',
      borderRadius: 999,
      padding: 6,
      zIndex: 50,
    }}>
      {items.map((item) => {
        const active = screen === item.id
        return (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            style={{
              background: active 
                ? 'linear-gradient(90deg, #1a1a1a, #2563eb)' 
                : 'transparent',
              color: active ? '#fff' : '#a3a3a3',
              border: 0,
              width: active ? 'auto' : 46,
              minHeight: 46,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: active ? 8 : 0,
              padding: active ? '8px 16px' : 8,
              fontSize: active ? 15 : 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'all .28s ease',
              cursor: 'pointer',
            }}
          >
            <item.icon active={active} />
            {active && <span>{item.label}</span>}
          </button>
        )
      })}
    </nav>
  )
  }

  if (screen === 'info') {
  return (
    <div key={screen} style={page}>
      <div style={{ ...title, marginBottom: 20 }}>Инфо</div>

      <button
        onClick={() => setScreen('catalog')}
        style={{
          background: '#1a1a1a',
          border: 0,
          borderRadius: 16,
          padding: '16px 20px',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          marginBottom: 16,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 20 }}>ⓘ</span>
        Дополнительно
      </button>

      <div style={{
        background: '#1a1a1a',
        borderRadius: 20,
        padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
          <span style={{ fontSize: 20 }}>?</span>
          Часто задаваемые вопросы (FAQ)
        </div>
        <div style={{ color: '#a3a3a3', fontSize: 14, lineHeight: 1.5, marginBottom: 16, textAlign: 'center' }}>
          Остались вопросы? Обратитесь в команду поддержки, чтобы получить ответ
        </div>
        <button
          onClick={() => window.open('https://t.me/optpuffy', '_blank')}
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #1a1a1a, #2563eb)',
            color: '#fff',
            border: 0,
            borderRadius: 999,
            padding: '14px 20px',
            fontSize: 16,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          Связаться с поддержкой
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

  
  if (screen === 'admin_write') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin_users')} style={backBtn}>Назад</button>
        <div style={title}>Написать</div>
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ color: '#a0a0a0', fontSize: 13, marginBottom: 8 }}>ID: {writeUserId}</div>
          <textarea value={writeText} onChange={(e) => setWriteText(e.target.value)} placeholder="Текст сообщения" rows={5} style={{ ...inputStyle, resize: 'vertical' as const, marginBottom: 0 }} />
        </div>
        <button onClick={sendWrite} style={btnMain}>Отправить</button>
        {toast ? <div style={{ marginTop: 12, textAlign: 'center', color: '#ccc' }}>{toast}</div> : null}
      </div>
    )
  }

  if (screen === 'admin_product_edit') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin_products')} style={backBtn}>Назад</button>
        <div style={title}>{isNewProduct ? 'Новый товар' : 'Редактирование'}</div>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 6 }}>Название</div>
          <input style={inputStyle} value={editProduct.name || ''} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 6 }}>Цена €</div>
          <input style={inputStyle} type="number" value={editProduct.price ?? 15} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 6 }}>Объём</div>
          <input style={inputStyle} value={editProduct.volume || '30ML'} onChange={(e) => setEditProduct({ ...editProduct, volume: e.target.value })} />
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 6 }}>Крепость</div>
          <input style={inputStyle} value={editProduct.strength || '50MG'} onChange={(e) => setEditProduct({ ...editProduct, strength: e.target.value })} />
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 6 }}>Описание</div>
          <textarea style={{ ...inputStyle, resize: 'vertical' as const }} rows={3} value={editProduct.description || ''} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 6 }}>Фото</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ ...inputStyle, padding: 10 }} />
          {editProduct.photo ? <img src={photoUrl(editProduct.photo) || ''} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} /> : null}
          <button onClick={() => setEditProduct({ ...editProduct, available: !editProduct.available })} style={{ ...btnMain, marginBottom: 10 }}>
            {editProduct.available !== false ? 'В наличии' : 'Нет в наличии'}
          </button>
          <button onClick={saveProduct} disabled={submitting} style={btnMain}>{submitting ? 'Сохранение...' : 'Сохранить'}</button>
          {!isNewProduct && editProduct.id ? (
            <button onClick={() => deleteProduct(editProduct.id!)} style={{ ...btnMain, marginTop: 10, background: 'rgba(80,20,20,0.6)' }}>Удалить товар</button>
          ) : null}
        </div>
      </div>
    )
  }

  if (screen === 'admin_products') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin')} style={backBtn}>Назад</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={title}>Товары</div>
          <button
            onClick={() => {
              setIsNewProduct(true)
              setEditProduct({ name: '', price: 15, volume: '30ML', strength: '50MG', description: '', available: true })
              setScreen('admin_product_edit')
            }}
            style={{ ...btnMain, width: 'auto', padding: '10px 14px' }}
          >
            Добавить
          </button>
        </div>
        {products.map((p) => (
          <div key={p.id} style={{ ...card, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, background: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
                {p.photo ? <img src={photoUrl(p.photo) || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 8 }}>{p.volume} · {p.strength} · {p.price} €</div>
                <div style={{ fontSize: 12, color: p.available ? '#ccc' : '#777' }}>{p.available ? 'В наличии' : 'Нет в наличии'}</div>
              </div>
            </div>
            <button onClick={() => { setIsNewProduct(false); setEditProduct({ ...p }); setScreen('admin_product_edit') }} style={{ ...btnMain, marginTop: 12 }}>Редактировать</button>
          </div>
        ))}
      </div>
    )
  }

       if (screen === 'admin_orders') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin')} style={backBtn}>Назад</button>
        <div style={title}>Заказы</div>
        {orders.length === 0 ? (
          <div style={card}>Нет новых заказов</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} style={{ ...card, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Заказ MONO-{o.id}</div>
              <div style={{ fontSize: 13, color: '#c0c0c0', marginBottom: 8 }}>
                Статус:{' '}
                {o.status === 'progress'
                  ? 'в процессе'
                  : o.status === 'done'
                    ? 'выполнен'
                    : o.status === 'cancelled'
                      ? 'отменён'
                      : 'ожидает'}
              </div>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>
                {o.full_name || '—'} @{o.username || '—'}
              </div>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>
                {o.items_text || o.product_name || 'Товар'}
              </div>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>
                {o.city || '—'}
                {o.place ? `, ${o.place}` : ''} · {o.payment || '—'}
              </div>
              {o.total ? (
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{o.total} €</div>
              ) : null}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' as const }}>
                <button onClick={() => setOrderStatus(o.id, 'progress')} style={{ ...btnMain, flex: 1 }}>
                  В процессе
                </button>
                <button onClick={() => setOrderStatus(o.id, 'done')} style={{ ...btnMain, flex: 1 }}>
                  Выполнен
                </button>
                <button
                  onClick={() => setOrderStatus(o.id, 'cancelled')}
                  style={{ ...btnMain, flex: 1, background: 'rgba(0,0,0,0.5)' }}
                >
                  Отменён
                </button>
                <button
                  onClick={() => deleteOrder(o.id)}
                  style={{ ...btnMain, flex: 1, background: 'rgba(80,20,20,0.6)' }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  if (screen === 'admin_users') {
    const maxPage = Math.max(0, Math.ceil(usersTotal / 10) - 1)
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin')} style={backBtn}>Назад</button>
        <div style={title}>Пользователи ({usersTotal})</div>
        {users.map((u) => (
          <div key={u.user_id} style={{ ...card, marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{u.full_name || '—'}</div>
            <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 10 }}>@{u.username || '—'} · ID {u.user_id}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setWriteUserId(u.user_id); setWriteText(''); setScreen('admin_write') }} style={{ ...btnMain, flex: 1 }}>Написать</button>
              <button onClick={() => toggleBlock(u.user_id, !u.is_blocked)} style={{ ...btnMain, flex: 1 }}>{u.is_blocked ? 'Разблок' : 'Блок'}</button>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button disabled={usersPage <= 0} onClick={() => loadUsers(usersPage - 1)} style={{ ...btnMain, flex: 1, opacity: usersPage <= 0 ? 0.4 : 1 }}>Назад</button>
          <button disabled={usersPage >= maxPage} onClick={() => loadUsers(usersPage + 1)} style={{ ...btnMain, flex: 1, opacity: usersPage >= maxPage ? 0.4 : 1 }}>Далее</button>
        </div>
      </div>
    )
  }

  if (screen === 'admin_broadcast') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin')} style={backBtn}>Назад</button>
        <div style={title}>Рассылка</div>
        <div style={card}>
          <textarea value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} placeholder="Текст для всех пользователей" rows={6} style={{ ...inputStyle, resize: 'vertical' as const, marginBottom: 12 }} />
          <button onClick={sendBroadcast} disabled={submitting} style={btnMain}>{submitting ? 'Отправка...' : 'Отправить всем'}</button>
        </div>
        {broadcastResult ? (
          <div style={{ ...card, marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>Отправлено: {broadcastResult.sent}</div>
            <div style={{ marginBottom: 8 }}>Не доставлено: {broadcastResult.failed.length}</div>
            {broadcastResult.failed.map((f) => (
              <div key={f.user_id} style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>{f.full_name} @{f.username || '—'} · {f.user_id}</div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (screen === 'admin_stats') {
  const periods: { id: 'today' | '7d' | '30d' | 'all'; label: string }[] = [
    { id: 'today', label: 'Сегодня' },
    { id: '7d', label: '7 дней' },
    { id: '30d', label: '30 дней' },
    { id: 'all', label: 'Всё время' },
  ]
  return (
    <div key={screen} style={page}>
      <button onClick={() => setScreen('admin')} style={backBtn}>Назад</button>
      <div style={title}>Статистика</div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setStatsPeriod(p.id)
              loadStats(p.id)
            }}
            style={{
              ...card,
              padding: '8px 12px',
              cursor: 'pointer',
              border: statsPeriod === p.id ? '1px solid #fff' : '1px solid transparent',
              fontWeight: statsPeriod === p.id ? 700 : 500,
              fontSize: 13,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#8a8a8a' }}>Пользователи</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats?.users ?? '—'}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#8a8a8a' }}>Заказы</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats?.orders ?? '—'}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#8a8a8a' }}>Товары в наличии</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats?.products ?? '—'}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#8a8a8a' }}>Сумма €</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats?.revenue ?? 0} €</div>
        </div>
      </div>
    </div>
  )
}

    if (screen === 'admin_chats') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin')} style={backBtn}>Назад</button>
        <div style={title}>Чаты</div>
        {chats.length === 0 ? (
          <div style={card}>Пока нет сообщений</div>
        ) : (
          chats.map((c) => (
            <button
              key={c.user_id}
              onClick={() => openChat(c.user_id)}
              style={{ ...card, width: '100%', textAlign: 'left' as const, cursor: 'pointer', marginBottom: 10, color: '#fff' }}
            >
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {c.full_name || '—'} {c.unread ? `(${c.unread})` : ''}
              </div>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginTop: 4 }}>@{c.username || '—'} · ID {c.user_id}</div>
              <div style={{ fontSize: 13, color: '#c0c0c0', marginTop: 6 }}>{c.last_text}</div>
            </button>
          ))
        )}
      </div>
    )
  }

  if (screen === 'admin_chat') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => { loadChats(); setScreen('admin_chats') }} style={backBtn}>Назад</button>
        <div style={title}>Чат {chatUserId}</div>
        <div style={{ ...card, marginBottom: 12, maxHeight: '45vh', overflowY: 'auto' }}>
          {chatMessages.map((m) => (
            <div key={m.id} style={{ marginBottom: 10, textAlign: m.from_admin ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '85%',
                padding: '10px 12px',
                borderRadius: 12,
                background: m.from_admin ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                fontSize: 14,
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <textarea
          value={chatReply}
          onChange={(e) => setChatReply(e.target.value)}
          placeholder="Ответ..."
          rows={3}
          style={{ ...inputStyle, resize: 'none' as const }}
        />
        <button onClick={sendChatReply} disabled={submitting} style={btnMain}>
          {submitting ? 'Отправка...' : 'Ответить'}
        </button>
      </div>
    )
  }

  if (screen === 'admin') {
  const items = [
    {
      id: 'admin_orders' as Screen,
      title: 'Заказы',
      fn: () => loadOrders(),
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      id: 'admin_products' as Screen,
      title: 'Товары',
      fn: () => {},
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'admin_users' as Screen,
      title: 'Клиенты',
      fn: () => loadUsers(0),
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'admin_broadcast' as Screen,
      title: 'Рассылка',
      fn: () => { setBroadcastResult(null); setBroadcastText(''); },
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22 11 13 2 9 22 2z" />
        </svg>
      ),
    },
    {
      id: 'admin_stats' as Screen,
      title: 'Отчёт',
      fn: () => loadStats(),
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'admin_chats' as Screen,
      title: 'Чаты',
      fn: () => loadChats(),
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ]
  return (
    <div key={screen} style={page}>
      <div style={title}>Админ</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginTop: 8,
      }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => { item.fn(); setScreen(item.id) }}
            style={{
              ...card,
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              padding: 16,
              color: '#e8e8e8',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            {item.icon}
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: '#e8e8e8',
            }}>
              {item.title}
            </div>
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}

  if (screen === 'success') {
    return (
      <div key={screen} style={page}>
        <div style={card}>
          <div style={{ ...title, marginBottom: 12 }}>Ожидает подтверждения</div>
          <div style={{ fontSize: 15, color: '#b0b0b0', lineHeight: 1.6, marginBottom: 20 }}>
            Заказ принят. Администратор скоро свяжется с вами и сообщит время и место встречи.
          </div>
          <button onClick={() => setScreen('catalog')} style={btnMain}>В каталог</button>
        </div>
      </div>
    )
  }

  if (screen === 'checkout') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('cart')} style={backBtn}>Назад</button>
        <div style={title}>Оформление</div>
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 10 }}>ГОРОД</div>
          {CITIES.map((c) => (
            <button key={c} onClick={() => setCity(c)} style={{ display: 'block', width: '100%', padding: 12, marginBottom: 8, background: city === c ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 15, textAlign: 'left' as const, cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 10 }}>МЕСТО ВСТРЕЧИ</div>
          <input style={inputStyle} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Например: Hauptbahnhof, у входа" />
        </div>
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 10 }}>ОПЛАТА</div>
          {PAYMENTS.map((p) => (
            <button key={p} onClick={() => setPayment(p)} style={{ display: 'block', width: '100%', padding: 12, marginBottom: 8, background: payment === p ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 15, textAlign: 'left' as const, cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
        <button disabled={!city || !payment || submitting} onClick={submitOrder} style={{ ...btnMain, opacity: city && payment && !submitting ? 1 : 0.45 }}>
          {submitting ? 'Отправка...' : 'Подтвердить заказ'}
        </button>
      </div>
    )
  }

  if (screen === 'product' && selected) {
    const img = photoUrl(selected.photo)
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('catalog')} style={backBtn}>Назад</button>
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ width: '100%', aspectRatio: '1/1', background: '#111' }}>
            {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: '"Playfair Display", Georgia, serif' }}>{selected.name}</div>
            <div style={{ fontSize: 14, color: '#a0a0a0', marginBottom: 8 }}>{selected.volume} · {selected.strength}</div>
            {selected.description ? <div style={{ fontSize: 14, color: '#b0b0b0', marginBottom: 12, lineHeight: 1.5 }}>{selected.description}</div> : null}
            <div style={{ display: 'inline-block', fontSize: 12, color: selected.available ? '#ddd' : '#777', border: '1px solid rgba(255,255,255,0.12)', padding: '5px 10px', borderRadius: 8, marginBottom: 14 }}>
              {selected.available ? 'В НАЛИЧИИ' : 'НЕТ В НАЛИЧИИ'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{profile?.has_discount ? 10 : selected.price} €</div>
            <button disabled={!selected.available} onClick={() => { addToCart(selected); setScreen('catalog') }} style={{ ...btnMain, opacity: selected.available ? 1 : 0.4 }}>В корзину</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'rules') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('profile')} style={backBtn}>Назад</button>
        <div style={title}>Правила</div>
        <div style={{ ...card, fontSize: 14, color: '#c0c0c0', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 12 }}>1. Возврат жидкостей после покупки не осуществляется.</p>
          <p style={{ marginBottom: 12 }}>2. Обмен вкуса возможен в течение 12 часов при неповреждённой упаковке и невскрытом флаконе.</p>
          <p style={{ marginBottom: 12 }}>3. Проверяйте товар при получении.</p>
          <p style={{ marginBottom: 12 }}>4. Администрация вправе отказать в обслуживании без объяснения причины.</p>
          <p style={{ marginBottom: 12 }}>5. Просим соблюдать уважительный тон при общении.</p>
          <p>6. Оформляя заказ, вы подтверждаете согласие с правилами MONO.</p>
        </div>
        <BottomNav />
      </div>
    )
  }

    if (screen === 'support') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('profile')} style={backBtn}>Назад</button>
        <div style={title}>Поддержка</div>
        <div style={{ ...card, marginBottom: 12, maxHeight: '50vh', overflowY: 'auto' }}>
          {supportMessages.length === 0 ? (
            <div style={{ color: '#a0a0a0', fontSize: 14, lineHeight: 1.6 }}>
              Напишите нам — обычно отвечаем в течение 5–15 минут.
            </div>
          ) : (
            supportMessages.map((m) => (
              <div
                key={m.id}
                style={{
                  marginBottom: 10,
                  textAlign: m.from_admin ? 'left' : 'right',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    maxWidth: '85%',
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: m.from_admin ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)',
                    fontSize: 14,
                    lineHeight: 1.4,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}
        </div>
        <textarea
          value={supportText}
          onChange={(e) => setSupportText(e.target.value)}
          placeholder="Сообщение..."
          rows={3}
          style={{ ...inputStyle, resize: 'none' as const }}
        />
        <button onClick={sendSupport} disabled={submitting} style={btnMain}>
          {submitting ? 'Отправка...' : 'Отправить'}
        </button>
        {toast ? <div style={{ marginTop: 10, textAlign: 'center', color: '#ccc' }}>{toast}</div> : null}
      </div>
    )
  }

    if (screen === 'favorites') {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('profile')} style={backBtn}>Назад</button>
        <div style={title}>Избранное</div>
        {favProducts.length === 0 ? (
          <div style={card}>Пока пусто — нажмите ♡ на товаре в каталоге</div>
        ) : (
          favProducts.map((p) => (
            <div key={p.id} style={{ ...card, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.name}</div>
              <div style={{ marginBottom: 10 }}>{p.price} €</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => addToCart(p)} style={{ ...btnMain, flex: 1 }}>В корзину</button>
                <button
                  onClick={() => toggleFav(p.id)}
                  style={{ ...btnMain, flex: 1, background: 'rgba(0,0,0,0.5)' }}
                >
                  Убрать
                </button>
              </div>
            </div>
          ))
        )}
                {toast ? (
          <div style={{
            position: 'fixed',
            bottom: 90,
            left: 16,
            right: 16,
            background: 'rgba(0,0,0,0.88)',
            color: '#fff',
            padding: 14,
            textAlign: 'center',
            fontSize: 14,
            borderRadius: 12,
            zIndex: 60,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {toast}
          </div>
        ) : null}
      </div>
    )
  }

        if (screen === 'profile') {
    return (
      <div key={screen} style={page}>
        <div style={{ ...title, marginBottom: 6 }}>Профиль</div>

        <div style={{ ...card, marginBottom: 12, fontSize: 14, color: '#c0c0c0' }}>
          Клиент: M-{String(profile?.client_no ?? '—').padStart(3, '0')}
        </div>

        <div style={{ fontSize: 14, color: '#a0a0a0', marginBottom: 18 }}>
          {tgUser?.first_name || 'Пользователь'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div style={card}>
            <div style={{ fontSize: 12, color: '#8a8a8a' }}>Покупок</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{profile?.purchases_count ?? 0}</div>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, color: '#8a8a8a' }}>Друзей</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{profile?.successful_referrals ?? 0}</div>
          </div>
        </div>

        <div style={{ ...card, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#8a8a8a' }}>Скидка</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {profile?.has_discount ? 'Есть (10€)' : 'Нет'}
          </div>
        </div>

        {/* ===== РЕФЕРАЛЬНАЯ ССЫЛКА (исправлено) ===== */}
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 8 }}>
            Реферальная ссылка
          </div>

          <div
            onClick={() => {
              const link = `https://t.me/itsmono_bot?start=ref_${tgUser?.id}`

              const textArea = document.createElement('textarea')
              textArea.value = link
              textArea.style.position = 'fixed'
              textArea.style.left = '-9999px'
              document.body.appendChild(textArea)
              textArea.select()
              textArea.setSelectionRange(0, 99999)

              try {
                document.execCommand('copy')
                showToast('Ссылка скопирована')
              } catch (e) {
                showToast('Не удалось скопировать')
              }

              document.body.removeChild(textArea)
            }}
            style={{
              fontSize: 13,
              color: '#c0c0c0',
              wordBreak: 'break-all' as const,
              cursor: 'pointer',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            https://t.me/itsmono_bot?start=ref_{tgUser?.id}
          </div>

          <div style={{ fontSize: 12, color: '#8a8a8a', marginTop: 8 }}>
            Нажми, чтобы скопировать
          </div>
        </div>
        {/* ===== КОНЕЦ РЕФЕРАЛЬНОЙ ССЫЛКИ ===== */}

        <button
          onClick={() => {
            loadFavorites()
            setScreen('favorites')
          }}
          style={{ ...btnMain, marginBottom: 10 }}
        >
          Избранное
        </button>

        <button
          onClick={() => {
            loadSupportMessages()
            setScreen('support')
          }}
          style={{ ...btnMain, marginBottom: 10 }}
        >
          Поддержка
        </button>

        <button onClick={() => setScreen('rules')} style={btnMain}>
          Правила
        </button>

        <BottomNav />
      </div>
    )
  }

 
  
  if (screen === 'cart') {
  const cartItems = cart
    .map(item => {
      const product = products.find(p => p.id === item.product?.id || p.id === item.product_id)
      return product ? { ...item, product } : null
    })
    .filter(Boolean) as { product: Product; quantity: number }[]

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div key={screen} style={page}>
      <div style={{ ...title, marginBottom: 20 }}>Корзина</div>

      {cartItems.length === 0 ? (
        <div style={{
          background: '#1a1a1a',
          borderRadius: 20,
          padding: '40px 20px',
          textAlign: 'center',
          marginTop: 40,
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32,
          }}>
            🛒
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Корзина пуста</div>
          <div style={{ color: '#a3a3a3', fontSize: 14 }}>
            Добавьте товары из каталога
          </div>
        </div>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.product.id} style={{
              background: '#1a1a1a',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                <div style={{ color: '#a3a3a3', fontSize: 14 }}>{item.product.price} € × {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{item.product.price * item.quantity} €</div>
            </div>
          ))}

          <div style={{
            background: '#1a1a1a',
            borderRadius: 16,
            padding: 16,
            marginTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 700,
            fontSize: 16,
          }}>
            <span>Итого</span>
            <span>{total} €</span>
          </div>

          <button
            onClick={() => setScreen('checkout')}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #1a1a1a, #2563eb)',
              color: '#fff',
              border: 0,
              borderRadius: 999,
              padding: '14px 20px',
              fontSize: 16,
              fontWeight: 600,
              marginTop: 16,
              cursor: 'pointer',
            }}
          >
            Оформить заказ
          </button>
        </>
      )}

      <BottomNav />
    </div>
  )
}

  return (
    <div key={screen} style={{ ...page, position: 'relative' }}>
      <div style={title}>Каталог</div>
      {loading ? <div style={{ color: '#a0a0a0', marginBottom: 12 }}>Загрузка...</div> : null}
      {!loading && products.length === 0 ? <div style={card}>Товаров пока нет</div> : null}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[...products].sort((a, b) => Number(b.available) - Number(a.available)).map((p) => {
          const img = photoUrl(p.photo)
          return (
            <div
              key={p.id}
              onClick={() => { setSelectedId(p.id); setScreen('product') }}
              style={{
                ...card,
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: p.available ? 1 : 0.55,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFav(p.id)
                }}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  border: 'none',
                  background: 'rgba(0,0,0,0.45)',
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  color: '#fff',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                {favIds.includes(p.id) ? '♥' : '♡'}
              </button>
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#111' }}>
                {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 4,
                  lineHeight: 1.3,
                  minHeight: 36,
                  fontFamily: '"Montserrat", system-ui, sans-serif',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase' as const,
                }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 10 }}>
                  {p.volume} · {p.strength}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    {profile?.has_discount ? 10 : p.price} €
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: p.available ? '#d0d0d0' : '#777',
                    border: `1px solid ${p.available ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}`,
                    padding: '3px 8px',
                    borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}>
                    {p.available ? 'В наличии' : 'Нет в наличии'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <BottomNav />
      {toast ? (
        <div style={{
          position: 'fixed',
          bottom: 90,
          left: 16,
          right: 16,
          background: 'rgba(0,0,0,0.88)',
          color: '#fff',
          padding: 14,
          textAlign: 'center',
          fontSize: 14,
          borderRadius: 12,
          zIndex: 60,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {toast}
        </div>
          ) : null}
    </div>
   )
}

export default App
