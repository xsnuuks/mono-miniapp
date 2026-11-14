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
  | 'catalog' | 'product' | 'cart' | 'checkout' | 'wholesale_checkout' | 'wholesale_delivery' | 'wholesale_review' | 'success' | 'conditions'
  | 'profile' | 'rules' | 'info' | 'delivery'
  | 'admin' | 'admin_orders' | 'admin_products' | 'admin_product_edit'
  | 'admin_users' | 'admin_write' | 'admin_broadcast' | 'admin_retail' | 'admin_wholesale' | 'admin_stats' | 'support' | 'admin_chats' | 'admin_chat' | 'favorites' | 'wholesale' | 'wholesale_product' | 'retail_product' | 'retail_checkout'

const CITIES = ['Reutlingen', 'Pfullingen', 'Eningen', 'Betzingen']
const WHOLESALE_DIAL_CODES: Record<string, string> = {
  PL: '+48',
  AT: '+43',
  BE: '+32',
  BG: '+359',
  HU: '+36',
  DE: '+49',
  GR: '+30',
  DK: '+45',
  IE: '+353',
  ES: '+34',
  IT: '+39',
  CY: '+357',
  LV: '+371',
  LT: '+370',
  LU: '+352',
  MT: '+356',
  NL: '+31',
  PT: '+351',
  RO: '+40',
  SK: '+421',
  SI: '+386',
  FI: '+358',
  FR: '+33',
  HR: '+385',
  CZ: '+420',
  SE: '+46',
  EE: '+372',
}
const PAYMENTS = ['Наличные', 'Банковский перевод']

const card = {
  background: 'rgba(8,8,8,0.82)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: 16,
}

const adminCard = {
  background: 'linear-gradient(180deg, rgba(20,20,24,0.98), rgba(13,13,16,0.98))',
  border: '1px solid rgba(168,85,247,0.22)',
  borderRadius: 18,
  padding: 14,
  boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
}

const adminBadge = (active: boolean) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: active ? '#d1fae5' : '#ddd',
  background: active ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.06)',
  border: active
    ? '1px solid rgba(16,185,129,0.35)'
    : '1px solid rgba(255,255,255,0.08)',
})

const adminMiniStat = {
  flex: 1,
  minWidth: 0,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  padding: '10px 12px',
}

const adminActionBtn = {
  flex: 1,
  minWidth: 0,
  padding: '11px 12px',
  borderRadius: 12,
  border: '1px solid rgba(168,85,247,0.22)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
}

const adminPrimaryBtn = {
  ...adminActionBtn,
  background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
  border: 'none',
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
  background: '#111111',
  minHeight: '100vh',
  color: '#f2f2f2',
  fontFamily: '"Montserrat", system-ui, sans-serif',
  fontSize: 15,
  fontWeight: 500,
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


function App() {
  const [screen, setScreen] = useState<Screen>('catalog')
  const [selectedId] = useState<number | null>(null)
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
  const [showDiscountInfo, setShowDiscountInfo] = useState(false)
  const [wholesaleProducts, setWholesaleProducts] = useState<any[]>([])
  const [retailProducts, setRetailProducts] = useState<any[]>([])
  const wholesaleDragRef = useRef<{
  fromId: number
  toId: number
} | null>(null)

const [wholesaleDraggingId, setWholesaleDraggingId] =
  useState<number | null>(null)

const [wholesaleDragTargetId, setWholesaleDragTargetId] =
  useState<number | null>(null)
  const [selectedRetailId, setSelectedRetailId] = useState<number | null>(null)
  const [retailFlavors, setRetailFlavors] = useState<any[]>([])
  const [retailQty, setRetailQty] = useState<Record<number, number>>({})
  const [retailLoading, setRetailLoading] = useState(false)
  const [selectedWholesaleId, setSelectedWholesaleId] = useState<number | null>(null)
  const [wholesaleFlavors, setWholesaleFlavors] = useState<any[]>([])
  const [wholesaleTiers, setWholesaleTiers] = useState<any[]>([])
  const [wholesaleQty, setWholesaleQty] = useState<Record<number, number>>({})
  const [wholesaleLoading, setWholesaleLoading] = useState(false)
  const [wholesaleContact, setWholesaleContact] = useState({
  first_name: '',
  last_name: '',
  phone: '+49',
  email: '',
})

const [wholesaleCountry, setWholesaleCountry] = useState('DE')
const [wholesaleCarrier, setWholesaleCarrier] = useState('')
const [wholesalePayment, setWholesalePayment] = useState<'USDT' | 'UAH' | ''>('')
const [wholesaleAddress, setWholesaleAddress] = useState({
  city: '',
  postal_code: '',
  street: '',
  house: '',
})
  const [retailCart, setRetailCart] = useState<{
  productId: number
  productName: string
  flavorId: number
  flavorName: string
  quantity: number
  stock: number
}[]>([])

const [wholesaleCart, setWholesaleCart] = useState<{
  productId: number
  productName: string
  flavorId: number
  flavorName: string
  quantity: number
}[]>([])
  const [tiers, setTiers] = useState<any[]>([])
  const [flavors, setFlavors] = useState<any[]>([])
  const [minQty, setMinQty] = useState('')
  const [price, setPrice] = useState('')
  const [flavorName, setFlavorName] = useState('')
  const [flavorStock, setFlavorStock] = useState('0')
  const [productName, setProductName] = useState('')
  const [optCat, setOptCat] = useState('all')
  const [priceMode, setPriceMode] = useState<'retail' | 'wholesale'>('retail')
  const [retailDeliveryData, setRetailDeliveryData] = useState({
  firstName: '',
  lastName: '',
  phone: '+49',
  email: '',
  city: '',
  postalCode: '',
  street: '',
  house: '',
  apartment: '',
})

const [retailDeliverySaved, setRetailDeliverySaved] = useState(false)
  const [retailCheckoutStep, setRetailCheckoutStep] = useState(1)
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>(() => {
  try {
    return localStorage.getItem('puffy_retail_delivery') === 'delivery'
      ? 'delivery'
      : 'pickup'
  } catch {
    return 'pickup'
  }
})

useEffect(() => {
  try {
    localStorage.setItem('puffy_retail_delivery', deliveryType)
  } catch {
    // Настройка продолжит работать в текущем сеансе
  }
}, [deliveryType])
  const [ageConfirmed, setAgeConfirmed] = useState(false)

function confirmAge() {
  setAgeConfirmed(true)
}

function rejectAge() {
  const tg = (window as any).Telegram?.WebApp
  tg?.close()
}

const fileRef = useRef<HTMLInputElement>(null)

  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  const IS_ADMIN = tgUser?.id === ADMIN_ID
  const selected = products.find((p) => p.id === selectedId)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
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

async function loadRetailProducts() {
  try {
    const response = await fetch(
      `${API_URL}/api/retail/products`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const list = Array.isArray(data)
      ? data
      : (data.products || [])

    const productsWithPrices = await Promise.all(
      list.map(async (p: any) => {
        try {
          const r = await fetch(
            `${API_URL}/api/retail/products/${p.id}/tiers`
          )

          if (!r.ok) throw new Error('Ошибка загрузки цен')

          const result = await r.json()

          return {
            ...p,
            retail_tiers: (
              Array.isArray(result)
                ? result
                : (result.tiers || [])
            ).sort(
              (a: any, b: any) =>
                Number(a.min_qty) - Number(b.min_qty)
            ),
          }
        } catch {
          return { ...p, retail_tiers: [] }
        }
      })
    )

    setRetailProducts(productsWithPrices)
  } catch (error) {
    console.error('Retail products error:', error)
    showToast('Не удалось загрузить розничные товары')
  }
}
  
async function loadWholesaleProducts() {
  try {
    const r = await fetch(
      `${API_URL}/api/wholesale/products`
    )

    if (!r.ok) {
      throw new Error('Ошибка загрузки оптовых товаров')
    }

    const data = await r.json()

    const list = Array.isArray(data)
      ? data
      : (data.products || [])

    const productsWithTiers = await Promise.all(
  list.map(async (p: any) => {
    try {
      const response = await fetch(
        `${API_URL}/api/wholesale/products/${p.id}/tiers`
      )
      if (!response.ok) throw new Error('Ошибка загрузки цен')
      const data = await response.json()
      return {
        ...p,
        wholesale_tiers: Array.isArray(data)
          ? data
          : (data.tiers || []),
      }
    } catch {
      return { ...p, wholesale_tiers: [] }
    }
  })
)
    
    setWholesaleProducts(
      productsWithTiers.map((p: any) => ({
        ...p,
        id: p.id,
        name: p.name,
        category: p.category ?? p.category_id ?? 'жижи',
        category_id: p.category_id,
        photo_url: p.photo_url ?? null,
        is_visible: p.is_visible ?? 1,
        prices: Array.isArray(p.tiers)
          ? p.tiers.length
          : (p.prices ?? 0),
        flavors: Array.isArray(p.flavors)
          ? p.flavors.length
          : (p.flavors_count ?? 0),
        stock: p.stock ?? 0,
      }))
    )
  } catch (error) {
    console.error('Wholesale load error:', error)
    showToast('Не удалось загрузить оптовые товары')
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
    loadWholesaleProducts()
    loadRetailProducts()
    loadFavIds()
    if (tgUser?.id) {
      fetch(`${API_URL}/profile/${tgUser.id}`)
        .then((r) => r.json())
        .then((d) => setProfile(d))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (screen.startsWith('admin_wholesale_tiers_')) {
      const id = Number(screen.replace('admin_wholesale_tiers_', ''))
      fetch(`${API_URL}/api/wholesale/products/${id}/tiers`)
        .then(r => {
          if (!r.ok) throw new Error('Ошибка загрузки цен')
          return r.json()
        })
        .then(d => setTiers(Array.isArray(d) ? d : d.tiers || []))
        .catch(() => setTiers([]))
    }

    if (screen.startsWith('admin_wholesale_flavors_')) {
      const id = Number(screen.replace('admin_wholesale_flavors_', ''))
      fetch(`${API_URL}/api/wholesale/products/${id}/flavors`)
        .then(r => {
          if (!r.ok) throw new Error('Ошибка загрузки вкусов')
          return r.json()
        })
        .then(d => setFlavors(Array.isArray(d) ? d : d.flavors || []))
        .catch(() => setFlavors([]))
    }
  }, [screen])

  useEffect(() => {
  if (selectedRetailId === null) return

  let cancelled = false

  async function loadRetailDetails() {
    setRetailLoading(true)
    setRetailFlavors([])
    setRetailQty({})

    try {
      const response = await fetch(
        `${API_URL}/api/retail/products/${selectedRetailId}/flavors`
      )

      if (!response.ok) {
        throw new Error('Ошибка загрузки вкусов')
      }

      const data = await response.json()

      if (!cancelled) {
        setRetailFlavors(
          Array.isArray(data) ? data : (data.flavors || [])
        )
      }
    } catch (error) {
      console.error('Retail flavors:', error)
      if (!cancelled) showToast('Не удалось загрузить вкусы')
    } finally {
      if (!cancelled) setRetailLoading(false)
    }
  }

  void loadRetailDetails()

  return () => {
    cancelled = true
  }
}, [selectedRetailId])
  
  useEffect(() => {
    if (selectedWholesaleId === null) return

    let cancelled = false

    async function loadWholesaleDetails() {
      setWholesaleLoading(true)
      setWholesaleFlavors([])
      setWholesaleTiers([])
      setWholesaleQty({})

      try {
        const id = selectedWholesaleId
        const [flavorsResponse, tiersResponse] = await Promise.all([
          fetch(`${API_URL}/api/wholesale/products/${id}/flavors`),
          fetch(`${API_URL}/api/wholesale/products/${id}/tiers`)
        ])

        if (!flavorsResponse.ok || !tiersResponse.ok) {
          throw new Error('Ошибка загрузки товара')
        }

        const flavorsData = await flavorsResponse.json()
        const tiersData = await tiersResponse.json()

        if (cancelled) return

        setWholesaleFlavors(
          Array.isArray(flavorsData)
            ? flavorsData
            : (flavorsData.flavors || [])
        )

        setWholesaleTiers(
          Array.isArray(tiersData)
            ? tiersData
            : (tiersData.tiers || [])
        )
      } catch (error) {
        if (!cancelled) {
          console.error(error)
          showToast('Не удалось загрузить товар')
        }
      } finally {
        if (!cancelled) setWholesaleLoading(false)
      }
    }

    loadWholesaleDetails()

    return () => {
      cancelled = true
    }
  }, [selectedWholesaleId])
  
  function addToCart(product: Product) {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id)
      if (ex) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
      return [...prev, { product, quantity: 1 }]
    })
    showToast('Товар добавлен в корзину')
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

  function RetailDeliverySelector() {
  const [opened, setOpened] = useState(false)

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpened(!opened)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          background: '#321b48',
          border: '1px solid #7545a0',
          color: '#fff',
          borderRadius: 13,
          padding: '11px 12px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 15 }}>⌖</span>
        {deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка'}
        <span style={{ fontSize: 11 }}>⌄</span>
      </button>

      {opened && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 7px)',
          right: 0,
          width: 170,
          padding: 6,
          borderRadius: 13,
          background: '#24152f',
          border: '1px solid #7545a0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          zIndex: 100,
        }}>
          {([
            { id: 'pickup', label: 'Самовывоз' },
            { id: 'delivery', label: 'Доставка' },
          ] as const).map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setDeliveryType(option.id)
                setOpened(false)
              }}
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'left',
                background: deliveryType === option.id
                  ? 'rgba(168,85,247,0.24)'
                  : 'transparent',
                border: 'none',
                borderRadius: 9,
                padding: '12px',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

  function RetailTopBar({ wholesale = false }: { wholesale?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 46,
      marginBottom: 20,
      position: 'relative',
      zIndex: 20,
    }}>
      <div style={{
        fontSize: 19,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '-0.3px',
      }}>
        PUFFY STORE
      </div>

      {wholesale ? (
        <div style={{
          background: 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 12,
          padding: '10px 14px',
          color: '#a855f7',
          fontSize: 13,
          fontWeight: 700,
        }}>
          Опт
        </div>
      ) : (
        <RetailDeliverySelector />
      )}
    </div>
  )
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
    { id: 'catalog' as Screen, label: 'Каталог', icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#a3a3a3'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    )},
    { id: 'cart' as Screen, label: cartCount > 0 ? `Корзина ${cartCount}` : 'Корзина', icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#a3a3a3'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    )},
    { id: 'info' as Screen, label: 'Инфо', icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#a3a3a3'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    )},
    { id: 'profile' as Screen, label: 'Профиль', icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#a3a3a3'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )},
    ...(IS_ADMIN ? [{ id: 'admin' as Screen, label: 'Админ', icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#a3a3a3'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    )}] : []),
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
              background: active ? 'linear-gradient(90deg, #2e1065, #7c3aed)' : 'transparent',
              border: 0,
              borderRadius: 999,
              padding: active ? '8px 14px' : '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: active ? '#fff' : '#a3a3a3',
              cursor: 'pointer',
            }}
          >
            {item.icon(active)}
            {active && <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>}
          </button>
        )
      })}
    </nav>
  )
}

  if (!ageConfirmed) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a0b2e, #2e1065)',
        borderRadius: 24,
        padding: '32px 24px',
        maxWidth: 340,
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 20px 60px rgba(124, 58, 237, 0.25)',
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'rgba(124, 58, 237, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
          fontWeight: 800,
          color: '#c4b5fd',
        }}>
          18+
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Вам есть 18 лет?
        </div>
        <div style={{ color: '#a3a3a3', fontSize: 14, marginBottom: 24, lineHeight: 1.4 }}>
          Подтвердите возраст, чтобы продолжить.
        </div>

        <button
          onClick={confirmAge}
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
            color: '#fff',
            border: 0,
            borderRadius: 14,
            padding: '14px 20px',
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 10,
            cursor: 'pointer',
          }}
        >
          Да, мне есть 18
        </button>

        <button
          onClick={rejectAge}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#d0d0d0',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14,
            padding: '14px 20px',
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Нет, выйти
        </button>
      </div>
    </div>
  )
}
  
  if (screen === 'info') {
  return (
    <div key={screen} style={page}>
      <RetailTopBar wholesale={priceMode === 'wholesale'} />
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
            background: 'linear-gradient(90deg, #2e1065, #7c3aed)',
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
  id: 'admin_retail' as Screen,
  title: 'Розница',
  fn: () => loadRetailProducts(),
  icon: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#a855f7"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M3 11h18M7 7V3h10v4" />
    </svg>
  ),
},
    {
  id: 'admin_wholesale' as Screen,
  title: 'Опт',
  fn: () => setScreen('admin_wholesale'),
  icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
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

  if (/^admin_retail_(all|\d+)$/.test(screen)) {
  const catId = screen.replace('admin_retail_', '')

  const categoryNames: Record<string, string> = {
    all: 'Все товары',
    '1': 'Жижи',
    '2': 'Одноразки',
    '3': 'Поды',
    '4': 'Картриджи',
    '5': 'Снюс',
  }

  const categoryProducts = retailProducts.filter(
    p => catId === 'all' || String(p.category_id) === catId
  )

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 0 90px' }}>
        <button
          type="button"
          style={backBtn}
          onClick={() => setScreen('admin_retail')}
        >
          ← Назад
        </button>

        <h2 style={{
          fontSize: 24,
          margin: '10px 0 6px',
        }}>
          {categoryNames[catId] || 'Розница'}
        </h2>

        <p style={{
          color: '#999',
          fontSize: 13,
          marginBottom: 20,
        }}>
          Управление розничными товарами
        </p>

        <button
          type="button"
          onClick={() =>
            setScreen(`admin_retail_add_${catId}` as Screen)
          }
          style={{
            ...adminPrimaryBtn,
            width: '100%',
            padding: 15,
            fontSize: 15,
            marginBottom: 20,
          }}
        >
          + Добавить товар
        </button>

        {categoryProducts.length === 0 ? (
          <div style={{
            ...adminCard,
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 38,
              marginBottom: 14,
            }}>
              📦
            </div>

            <div style={{
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 8,
            }}>
              Товаров пока нет
            </div>

            <div style={{
              fontSize: 13,
              color: '#999',
              lineHeight: 1.6,
            }}>
              Добавь первый товар в новую розницу.
              Старый ассортимент сюда не переносится.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {categoryProducts.map(p => (
              <div
                key={p.id}
                style={adminCard}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 76,
                    height: 76,
                    flexShrink: 0,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {p.photo_url ? (
                      <img
                        src={photoUrl(p.photo_url) || ''}
                        alt={p.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 28 }}>📦</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 700,
                      overflowWrap: 'anywhere',
                      marginBottom: 8,
                    }}>
                      {p.name}
                    </div>

                    <span style={adminBadge(
                      Number(p.is_visible) === 1
                    )}>
                      {Number(p.is_visible) === 1
                        ? '● Опубликован'
                        : '○ Скрыт'}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 14,
                }}>
                  {[
                    { label: 'Вкусов', value: p.flavors_count || 0 },
                    { label: 'Остаток', value: p.stock || 0 },
                    { label: 'Порогов', value: p.prices || 0 },
                  ].map(stat => (
                    <div key={stat.label} style={adminMiniStat}>
                      <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                      }}>
                        {stat.value}
                      </div>

                      <div style={{
                        fontSize: 11,
                        color: '#aaa',
                        marginTop: 4,
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
  
  if (screen === 'admin_retail') {
  const categories = [
    { id: 'all', name: 'Все' },
    { id: '1', name: 'Жижи' },
    { id: '2', name: 'Одноразки' },
    { id: '3', name: 'Поды' },
    { id: '4', name: 'Картриджи' },
    { id: '5', name: 'Снюс' },
  ]

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 0 90px' }}>
        <button
          type="button"
          onClick={() => setScreen('admin')}
          style={backBtn}
        >
          ← Назад
        </button>

        <h2 style={{ fontSize: 24, margin: '10px 0 6px' }}>
          Розница
        </h2>

        <p style={{
          color: '#aaa',
          fontSize: 13,
          marginBottom: 22,
        }}>
          Управление розничным ассортиментом
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          {categories.map(category => {
            const count = retailProducts.filter(
              product =>
                category.id === 'all' ||
                String(product.category_id) === category.id
            ).length

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setScreen(
                    `admin_retail_${category.id}` as Screen
                  )
                }
                style={{
                  ...adminCard,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 18,
                }}
              >
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 16,
                  }}>
                    {category.name}
                  </div>

                  <div style={{
                    color: '#999',
                    fontSize: 12,
                    marginTop: 6,
                  }}>
                    {count} товаров
                  </div>
                </div>

                <span style={{
                  color: '#a855f7',
                  fontSize: 25,
                }}>
                  ›
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
  
    if (screen === 'admin_wholesale') {
  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button onClick={() => setScreen('admin')} style={backBtn}>← Назад</button>
        <h2 style={{ margin: '16px 0 8px', fontSize: 22 }}>Опт</h2>
        <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>
          Категории
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
           
{[
  { id: 'all', name: 'Все' },
  { id: '1', name: 'Жижи' },
  { id: '2', name: 'Одноразки' },
  { id: '3', name: 'Поды' },
  { id: '4', name: 'Картриджи' },
  { id: '5', name: 'Снюс' },
].map(cat => (

            <button
              key={cat.id}
              onClick={() => setScreen(`admin_wholesale_${cat.id}` as any)}
              style={{
                ...card,
                textAlign: 'left',
                padding: '14px 16px',
                cursor: 'pointer',
                border: 'none',
                width: '100%',
              }}
            >
              <div style={{ fontWeight: 600 }}>{cat.name}</div>
<div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
  {wholesaleProducts.filter(p => cat.id === 'all' || String(p.category_id) === cat.id).length} товаров
</div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

  async function finishWholesaleDrag(categoryId: string) {
  const drag = wholesaleDragRef.current

  wholesaleDragRef.current = null
  setWholesaleDraggingId(null)
  setWholesaleDragTargetId(null)

  if (!drag || categoryId === 'all') return
  if (drag.fromId === drag.toId) return

  const categoryProducts = wholesaleProducts.filter(
    p => String(p.category_id) === categoryId
  )

  const fromIndex = categoryProducts.findIndex(
    p => Number(p.id) === drag.fromId
  )
  const toIndex = categoryProducts.findIndex(
    p => Number(p.id) === drag.toId
  )

  if (fromIndex < 0 || toIndex < 0) return

  const reordered = [...categoryProducts]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)

  const ids = reordered.map(p => Number(p.id))

  setWholesaleProducts(prev => {
    let index = 0

    return prev.map(p => {
      if (String(p.category_id) !== categoryId) return p
      return reordered[index++]
    })
  })

  try {
    const response = await fetch(
      `${API_URL}/api/wholesale/products/reorder`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': String(tgUser?.id || ''),
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          product_ids: ids,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    await loadWholesaleProducts()
    showToast('Порядок товаров сохранён')
  } catch (error) {
    console.error('Wholesale reorder error:', error)
    await loadWholesaleProducts()
    showToast('Не удалось сохранить порядок')
  }
}
  
if (/^admin_wholesale_(all|\d+)$/.test(screen)) {
  const catId = screen.replace('admin_wholesale_', '')
  const catName: string = ({
  all: 'Все',
  '1': 'Жижи',
  '2': 'Одноразки',
  '3': 'Поды',
  '4': 'Картриджи',
  '5': 'Снюс',
} as Record<string, string>)[catId] || catId

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button onClick={() => setScreen('admin_wholesale')} style={backBtn}>← Назад</button>
        <h2 style={{ margin: '16px 0 8px', fontSize: 22 }}>{catName}</h2>
        <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>
          Товары в категории
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
  {wholesaleProducts.filter(
    p => catId === 'all' || String(p.category_id) === catId
  ).length === 0 ? (
    <div style={{
      ...adminCard,
      textAlign: 'center',
      color: '#aaa',
      padding: 28,
    }}>
      Товаров пока нет
    </div>
  ) : (
    wholesaleProducts
      .filter(p =>
        catId === 'all' || String(p.category_id) === catId
      )
      .map(p => (
        <button
          key={p.id}
          type="button"
          data-wholesale-sort-id={p.id}
          onClick={() =>
            setScreen(`admin_wholesale_product_${p.id}` as any)
          }
          style={{
            ...adminCard,
            width: '100%',
            color: '#fff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 76,
              height: 76,
              flexShrink: 0,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {p.photo_url ? (
                <img
                  src={photoUrl(p.photo_url) || ''}
                  alt={p.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <span style={{ fontSize: 26 }}>📦</span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 8,
                overflowWrap: 'anywhere',
              }}>
                {p.name}
              </div>

              <span style={adminBadge(
                Number(p.is_visible) === 1
              )}>
                {Number(p.is_visible) === 1
                  ? '● Опубликован'
                  : '○ Скрыт'}
              </span>
            </div>

            <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}}>
  {catId !== 'all' && (
    <span
      role="button"
      aria-label={`Переместить ${p.name}`}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onPointerDown={e => {
        e.preventDefault()
        e.stopPropagation()

        e.currentTarget.setPointerCapture(e.pointerId)

        wholesaleDragRef.current = {
          fromId: Number(p.id),
          toId: Number(p.id),
        }

        setWholesaleDraggingId(Number(p.id))
        setWholesaleDragTargetId(Number(p.id))
      }}
      onPointerMove={e => {
        const drag = wholesaleDragRef.current
        if (!drag || drag.fromId !== Number(p.id)) return

        const element = document.elementFromPoint(
          e.clientX,
          e.clientY
        ) as HTMLElement | null

        const target = element?.closest(
          '[data-wholesale-sort-id]'
        )

        const targetId = Number(
          target?.getAttribute('data-wholesale-sort-id')
        )

        const valid = wholesaleProducts.some(
          item =>
            Number(item.id) === targetId &&
            String(item.category_id) === catId
        )

        if (valid) {
          drag.toId = targetId
          setWholesaleDragTargetId(targetId)
        }
      }}
      onPointerUp={e => {
        e.preventDefault()
        e.stopPropagation()
        void finishWholesaleDrag(catId)
      }}
      onPointerCancel={() => {
        wholesaleDragRef.current = null
        setWholesaleDraggingId(null)
        setWholesaleDragTargetId(null)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 48,
        borderRadius: 12,
        background:
          wholesaleDraggingId === Number(p.id)
            ? 'rgba(168,85,247,0.3)'
            : 'rgba(168,85,247,0.12)',
        border:
          wholesaleDragTargetId === Number(p.id) &&
          wholesaleDraggingId !== null
            ? '2px solid #a855f7'
            : '1px solid rgba(168,85,247,0.25)',
        color: '#d8b4fe',
        fontSize: 28,
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      ⠿
    </span>
  )}

  <span style={{
    color: '#a855f7',
    fontSize: 22,
  }}>
    ›
  </span>
</div>
</div>            

          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 14,
          }}>
            {[
              { label: 'Вкусов', value: p.flavors || 0 },
              { label: 'Остаток', value: p.stock || 0 },
              { label: 'Порогов', value: p.prices || 0 },
            ].map(stat => (
              <div key={stat.label} style={adminMiniStat}>
                <div style={{
                  fontSize: 17,
                  fontWeight: 700,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#aaa',
                  marginTop: 4,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </button>
      ))
  )}
</div>

        <button
          onClick={() => setScreen(`admin_wholesale_add_${catId}` as any)}
          style={{ ...btnMain, marginTop: 16 }}
        >
          + Добавить товар
        </button>
      </div>
      <BottomNav />
    </div>
  )
}

  if (screen.startsWith('admin_retail_add_')) {
  const catId = screen.replace('admin_retail_add_', '')

  const categoryNames: Record<string, string> = {
    '1': 'Жижи',
    '2': 'Одноразки',
    '3': 'Поды',
    '4': 'Картриджи',
    '5': 'Снюс',
  }

  const fieldStyle = {
    ...inputStyle,
    boxSizing: 'border-box' as const,
    marginBottom: 0,
    minWidth: 0,
  }

  const fieldLabel = {
    display: 'block',
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 600,
  }

  const removeStyle = {
    border: '1px solid rgba(255,90,90,0.25)',
    background: 'rgba(255,90,90,0.08)',
    color: '#ff8585',
    borderRadius: 12,
    padding: '10px 14px',
    cursor: 'pointer',
  }

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '12px 0 90px' }}>
        <button
          type="button"
          onClick={() => setScreen(`admin_retail_${catId}` as Screen)}
          style={backBtn}
        >
          ← Назад
        </button>

        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 12,
            color: '#bb91ff',
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 7,
          }}>
            PUFFY STORE · РОЗНИЦА
          </div>

          <h2 style={{
            margin: '0 0 8px',
            fontSize: 24,
            fontWeight: 800,
          }}>
            Новый товар
          </h2>

          <div style={{ color: '#999', fontSize: 13 }}>
            Заполни информацию, цены и ассортимент
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (submitting) return

            const formData = new FormData(e.currentTarget)
            const categoryId = catId === 'all'
              ? Number(formData.get('category_id'))
              : Number(catId)

            if (!productName.trim()) {
              showToast('Введите название')
              return
            }

            if (!categoryNames[String(categoryId)]) {
              showToast('Выберите категорию')
              return
            }

            if (
              tiers.length === 0 ||
              tiers.some(t =>
                !Number.isInteger(Number(t.min_qty)) ||
                Number(t.min_qty) < 1 ||
                !Number.isFinite(Number(t.price)) ||
                Number(t.price) <= 0
              )
            ) {
              showToast('Проверь ценовые пороги')
              return
            }

            if (
              flavors.length === 0 ||
              flavors.some(f =>
                !String(f.name || '').trim() ||
                !Number.isInteger(Number(f.stock)) ||
                Number(f.stock) < 0
              )
            ) {
              showToast('Проверь вкусы и остатки')
              return
            }

            const quantities = tiers.map(t => Number(t.min_qty))
            if (new Set(quantities).size !== quantities.length) {
              showToast('Пороги количества не должны повторяться')
              return
            }

            setSubmitting(true)

            try {
              const response = await fetch(
                `${API_URL}/api/retail/products`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Id': String(tgUser?.id || ''),
                  },
                  body: JSON.stringify({
                    name: productName.trim(),
category_id: categoryId,
description: '',
                    tiers: tiers.map(t => ({
                      min_qty: Number(t.min_qty),
                      price: Number(t.price),
                    })),
                    flavors: flavors.map(f => ({
                      name: String(f.name).trim(),
                      stock: Number(f.stock),
                    })),
                  }),
                }
              )

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
              }

              const data = await response.json()

              if (!data.id) {
                throw new Error('Сервер не вернул ID товара')
              }

              await loadRetailProducts()

              setProductName('')
              setTiers([])
              setFlavors([])

              showToast('Товар создан')
              setScreen(`admin_retail_${categoryId}` as Screen)
            } catch (error) {
              console.error('Create retail product:', error)
              showToast('Не удалось создать товар')
            } finally {
              setSubmitting(false)
            }
          }}
          style={{ display: 'grid', gap: 16 }}
        >
          {/* ИНФОРМАЦИЯ */}

          <div style={adminCard}>
            <div style={{
              fontSize: 17,
              fontWeight: 800,
              marginBottom: 5,
            }}>
              01 · Информация
            </div>

            <div style={{
              fontSize: 12,
              color: '#999',
              marginBottom: 18,
            }}>
              Основные данные карточки
            </div>

            <label style={fieldLabel}>Название товара</label>

            <input
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Например, ELFLIQ 10ML"
              maxLength={120}
              required
              style={fieldStyle}
            />

            <div style={{ height: 16 }} />

            <label style={fieldLabel}>Категория</label>

            {catId === 'all' ? (
              <select
                name="category_id"
                required
                defaultValue=""
                style={fieldStyle}
              >
                <option value="" disabled>
                  Выбери категорию
                </option>
                {Object.entries(categoryNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{
                padding: 13,
                borderRadius: 12,
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.2)',
                fontWeight: 700,
              }}>
                {categoryNames[catId] || 'Категория не найдена'}
              </div>
            )}
          </div>

          {/* ЦЕНОВЫЕ ПОРОГИ */}

          <div style={adminCard}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                02 · Розничные цены
              </div>
              <span style={adminBadge(true)}>
                {tiers.length} шт.
              </span>
            </div>

            <div style={{
              fontSize: 12,
              color: '#999',
              lineHeight: 1.5,
              marginBottom: 16,
            }}>
              Укажи количество, от которого действует цена
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {tiers.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: 'rgba(255,255,255,0.035)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 700,
                    }}>
                      Порог №{i + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => setTiers(
                        prev => prev.filter((_, index) => index !== i)
                      )}
                      style={removeStyle}
                    >
                      Удалить
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={fieldLabel}>От шт.</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={t.min_qty}
                        onChange={e => setTiers(prev =>
                          prev.map((item, index) =>
                            index === i
                              ? {
                                  ...item,
                                  min_qty: e.target.value,
                                }
                              : item
                          )
                        )}
                        style={fieldStyle}
                        required
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={fieldLabel}>Цена € / шт.</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={t.price}
                        onChange={e => setTiers(prev =>
                          prev.map((item, index) =>
                            index === i
                              ? {
                                  ...item,
                                  price: e.target.value,
                                }
                              : item
                          )
                        )}
                        style={fieldStyle}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTiers(prev => [
                ...prev,
                { min_qty: 1, price: 15 },
              ])}
              style={{
                ...adminActionBtn,
                width: '100%',
                marginTop: 14,
                padding: 14,
                color: '#d8b4fe',
              }}
            >
              + Добавить ценовой порог
            </button>
          </div>

          {/* ВКУСЫ И ОСТАТКИ */}

          <div style={adminCard}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                03 · Вкусы
              </div>
              <span style={adminBadge(true)}>
                {flavors.length} шт.
              </span>
            </div>

            <div style={{
              fontSize: 12,
              color: '#999',
              marginBottom: 16,
            }}>
              Добавь варианты и остатки на складе
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {flavors.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: 'rgba(255,255,255,0.035)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      Вкус №{i + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => setFlavors(
                        prev => prev.filter((_, index) => index !== i)
                      )}
                      style={removeStyle}
                    >
                      Удалить
                    </button>
                  </div>

                  <label style={fieldLabel}>Название вкуса</label>
                  <input
                    value={f.name}
                    onChange={e => setFlavors(prev =>
                      prev.map((item, index) =>
                        index === i
                          ? { ...item, name: e.target.value }
                          : item
                      )
                    )}
                    placeholder="Например, Mango Ice"
                    style={fieldStyle}
                    required
                  />

                  <div style={{ height: 12 }} />

                  <label style={fieldLabel}>Остаток, шт.</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={f.stock}
                    onChange={e => setFlavors(prev =>
                      prev.map((item, index) =>
                        index === i
                          ? { ...item, stock: e.target.value }
                          : item
                      )
                    )}
                    style={fieldStyle}
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFlavors(prev => [
                ...prev,
                { name: '', stock: 0 },
              ])}
              style={{
                ...adminActionBtn,
                width: '100%',
                marginTop: 14,
                padding: 14,
                color: '#d8b4fe',
              }}
            >
              + Добавить вкус
            </button>
          </div>

          {/* СОХРАНЕНИЕ */}

          <div style={adminCard}>
            <div style={{
              fontWeight: 700,
              marginBottom: 8,
            }}>
              Готово к созданию?
            </div>

            <div style={{
              color: '#999',
              fontSize: 12,
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              Проверь название, цены и остатки. После
              создания можно будет загрузить фотографию
              и редактировать товар в админке.
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...adminPrimaryBtn,
                width: '100%',
                padding: 16,
                fontSize: 15,
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Создание...' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
  
if (screen.startsWith('admin_wholesale_add_')) {
  const catId = screen.replace('admin_wholesale_add_', '')

  const categoryNames: Record<string, string> = {
    '1': 'Жижи',
    '2': 'Одноразки',
    '3': 'Поды',
    '4': 'Картриджи',
    '5': 'Снюс',
  }

  const fieldStyle = {
    ...inputStyle,
    boxSizing: 'border-box' as const,
    marginBottom: 0,
    minWidth: 0,
  }

  const fieldLabel = {
    display: 'block',
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 600,
  }

  const removeStyle = {
    border: '1px solid rgba(255,90,90,0.25)',
    background: 'rgba(255,90,90,0.08)',
    color: '#ff8585',
    borderRadius: 12,
    padding: '10px 14px',
    cursor: 'pointer',
  }

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '12px 0 90px' }}>
        <button
          type="button"
          onClick={() => setScreen(`admin_wholesale_${catId}` as any)}
          style={backBtn}
        >
          ← Назад
        </button>

        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 12,
            color: '#bb91ff',
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 7,
          }}>
            PUFFY WHOLESALE
          </div>

          <h2 style={{
            margin: '0 0 8px',
            fontSize: 24,
            fontWeight: 800,
          }}>
            Новый товар
          </h2>

          <div style={{ color: '#999', fontSize: 13 }}>
            Заполни информацию, цены и ассортимент
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (submitting) return

            const formData = new FormData(e.currentTarget)
            const categoryId = catId === 'all'
              ? Number(formData.get('category_id'))
              : Number(catId)

            if (!productName.trim()) {
              showToast('Введите название')
              return
            }

            if (!categoryNames[String(categoryId)]) {
              showToast('Выберите категорию')
              return
            }

            if (
              tiers.length === 0 ||
              tiers.some(t =>
                !Number.isInteger(Number(t.min_qty)) ||
                Number(t.min_qty) < 1 ||
                !Number.isFinite(Number(t.price)) ||
                Number(t.price) <= 0
              )
            ) {
              showToast('Проверь ценовые пороги')
              return
            }

            if (
              flavors.length === 0 ||
              flavors.some(f =>
                !String(f.name || '').trim() ||
                !Number.isInteger(Number(f.stock)) ||
                Number(f.stock) < 0
              )
            ) {
              showToast('Проверь вкусы и остатки')
              return
            }

            const quantities = tiers.map(t => Number(t.min_qty))
            if (new Set(quantities).size !== quantities.length) {
              showToast('Пороги количества не должны повторяться')
              return
            }

            setSubmitting(true)

            try {
              const response = await fetch(
                `${API_URL}/api/wholesale/products`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Id': String(tgUser?.id || ''),
                  },
                  body: JSON.stringify({
                    name: productName.trim(),
                    category_id: categoryId,
                    photo_url: null,
                    tiers: tiers.map(t => ({
                      min_qty: Number(t.min_qty),
                      price: Number(t.price),
                    })),
                    flavors: flavors.map(f => ({
                      name: String(f.name).trim(),
                      stock: Number(f.stock),
                    })),
                  }),
                }
              )

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
              }

              const data = await response.json()

              if (!data.id) {
                throw new Error('Сервер не вернул ID товара')
              }

              await loadWholesaleProducts()

              setProductName('')
              setTiers([])
              setFlavors([])

              showToast('Товар создан')
              setScreen(`admin_wholesale_${categoryId}` as any)
            } catch (error) {
              console.error('Create wholesale product:', error)
              showToast('Не удалось создать товар')
            } finally {
              setSubmitting(false)
            }
          }}
          style={{ display: 'grid', gap: 16 }}
        >
          {/* ИНФОРМАЦИЯ */}

          <div style={adminCard}>
            <div style={{
              fontSize: 17,
              fontWeight: 800,
              marginBottom: 5,
            }}>
              01 · Информация
            </div>

            <div style={{
              fontSize: 12,
              color: '#999',
              marginBottom: 18,
            }}>
              Основные данные карточки
            </div>

            <label style={fieldLabel}>Название товара</label>

            <input
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Например, ELFLIQ 10ML"
              maxLength={120}
              required
              style={fieldStyle}
            />

            <div style={{ height: 16 }} />

            <label style={fieldLabel}>Категория</label>

            {catId === 'all' ? (
              <select
                name="category_id"
                required
                defaultValue=""
                style={fieldStyle}
              >
                <option value="" disabled>
                  Выбери категорию
                </option>
                {Object.entries(categoryNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{
                padding: 13,
                borderRadius: 12,
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.2)',
                fontWeight: 700,
              }}>
                {categoryNames[catId] || 'Категория не найдена'}
              </div>
            )}
          </div>

          {/* ЦЕНОВЫЕ ПОРОГИ */}

          <div style={adminCard}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                02 · Оптовые цены
              </div>
              <span style={adminBadge(true)}>
                {tiers.length} шт.
              </span>
            </div>

            <div style={{
              fontSize: 12,
              color: '#999',
              lineHeight: 1.5,
              marginBottom: 16,
            }}>
              Укажи количество, от которого действует цена
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {tiers.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: 'rgba(255,255,255,0.035)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 700,
                    }}>
                      Порог №{i + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => setTiers(
                        prev => prev.filter((_, index) => index !== i)
                      )}
                      style={removeStyle}
                    >
                      Удалить
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={fieldLabel}>От шт.</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={t.min_qty}
                        onChange={e => setTiers(prev =>
                          prev.map((item, index) =>
                            index === i
                              ? {
                                  ...item,
                                  min_qty: e.target.value,
                                }
                              : item
                          )
                        )}
                        style={fieldStyle}
                        required
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={fieldLabel}>Цена € / шт.</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={t.price}
                        onChange={e => setTiers(prev =>
                          prev.map((item, index) =>
                            index === i
                              ? {
                                  ...item,
                                  price: e.target.value,
                                }
                              : item
                          )
                        )}
                        style={fieldStyle}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTiers(prev => [
                ...prev,
                { min_qty: 20, price: 5.7 },
              ])}
              style={{
                ...adminActionBtn,
                width: '100%',
                marginTop: 14,
                padding: 14,
                color: '#d8b4fe',
              }}
            >
              + Добавить ценовой порог
            </button>
          </div>

          {/* ВКУСЫ И ОСТАТКИ */}

          <div style={adminCard}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                03 · Вкусы
              </div>
              <span style={adminBadge(true)}>
                {flavors.length} шт.
              </span>
            </div>

            <div style={{
              fontSize: 12,
              color: '#999',
              marginBottom: 16,
            }}>
              Добавь варианты и остатки на складе
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {flavors.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: 'rgba(255,255,255,0.035)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      Вкус №{i + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => setFlavors(
                        prev => prev.filter((_, index) => index !== i)
                      )}
                      style={removeStyle}
                    >
                      Удалить
                    </button>
                  </div>

                  <label style={fieldLabel}>Название вкуса</label>
                  <input
                    value={f.name}
                    onChange={e => setFlavors(prev =>
                      prev.map((item, index) =>
                        index === i
                          ? { ...item, name: e.target.value }
                          : item
                      )
                    )}
                    placeholder="Например, Mango Ice"
                    style={fieldStyle}
                    required
                  />

                  <div style={{ height: 12 }} />

                  <label style={fieldLabel}>Остаток, шт.</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={f.stock}
                    onChange={e => setFlavors(prev =>
                      prev.map((item, index) =>
                        index === i
                          ? { ...item, stock: e.target.value }
                          : item
                      )
                    )}
                    style={fieldStyle}
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFlavors(prev => [
                ...prev,
                { name: '', stock: 0 },
              ])}
              style={{
                ...adminActionBtn,
                width: '100%',
                marginTop: 14,
                padding: 14,
                color: '#d8b4fe',
              }}
            >
              + Добавить вкус
            </button>
          </div>

          {/* СОХРАНЕНИЕ */}

          <div style={adminCard}>
            <div style={{
              fontWeight: 700,
              marginBottom: 8,
            }}>
              Готово к созданию?
            </div>

            <div style={{
              color: '#999',
              fontSize: 12,
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              Проверь название, цены и остатки. После
              создания можно будет загрузить фотографию
              и редактировать товар в админке.
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...adminPrimaryBtn,
                width: '100%',
                padding: 16,
                fontSize: 15,
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Создание...' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}

  if (screen.startsWith('admin_wholesale_product_')) {
  const productId = Number(screen.replace('admin_wholesale_product_', ''))
  const product = wholesaleProducts.find(p => p.id === productId)

  if (!product) {
    return (
      <div key={screen} style={page}>
        <button onClick={() => setScreen('admin_wholesale')} style={backBtn}>← Назад</button>
        <div style={card}>Товар не найден</div>
      </div>
    )
  }

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button onClick={() => setScreen(`admin_wholesale_${product.category}` as any)} style={backBtn}>← Назад</button>
        <h2 style={{ margin: '16px 0 16px', fontSize: 22 }}>{product.name}</h2>

        <div style={{ ...card, marginBottom: 16 }}>
  <div style={{ fontWeight: 600, marginBottom: 12 }}>
    Фотография товара
  </div>

  {product.photo_url && (
    <img
      src={photoUrl(product.photo_url) || ''}
      alt={product.name}
      style={{
        width: '100%',
        maxHeight: 250,
        objectFit: 'contain',
        borderRadius: 12,
        marginBottom: 12,
      }}
    />
  )}

  <label
    style={{
      ...btnMain,
      display: 'block',
      textAlign: 'center',
      boxSizing: 'border-box',
    }}
  >
    {product.photo_url ? 'Заменить фото' : 'Выбрать фото'}

    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      style={{ display: 'none' }}
      onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
          showToast('Максимальный размер фото — 5 МБ')
          return
        }

        const initData =
          (window as any).Telegram?.WebApp?.initData

        if (!initData) {
          showToast('Открой админку через Telegram')
          return
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
          const response = await fetch(
            `${API_URL}/api/wholesale/products/${product.id}/photo`,
            {
              method: 'POST',
              headers: {
                'X-Telegram-Init-Data': initData,
              },
              body: formData,
            }
          )

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          await loadWholesaleProducts()
          showToast('Фотография сохранена')
        } catch (error) {
          console.error('Photo upload error:', error)
          showToast('Ошибка загрузки фотографии')
        } finally {
          e.target.value = ''
        }
      }}
    />
  </label>
</div>

        <div style={{ ...adminCard, marginBottom: 16 }}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        {product.name}
      </div>
      <div style={{ color: '#999', fontSize: 12, marginTop: 5 }}>
        Оптовый товар
      </div>
    </div>

    <span style={adminBadge(Number(product.is_visible) === 1)}>
      {Number(product.is_visible) === 1
        ? '● Опубликован'
        : '○ Скрыт'}
    </span>
  </div>

  <div style={{ display: 'flex', gap: 8 }}>
    {[
      { label: 'Вкусов', value: product.flavors || 0 },
      { label: 'В наличии', value: product.stock || 0 },
      { label: 'Порогов', value: product.prices || 0 },
    ].map(stat => (
      <div key={stat.label} style={adminMiniStat}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          {stat.value}
        </div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
          {stat.label}
        </div>
      </div>
    ))}
  </div>
</div>

<div style={{ ...adminCard, marginBottom: 16 }}>
  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
    Управление карточкой
  </div>

  <div style={{ display: 'grid', gap: 10 }}>
    <form
  key={`edit-name-${product.id}`}
  onSubmit={async (e) => {
    e.preventDefault()

    const form = e.currentTarget
    const fd = new FormData(form)
    const newName = String(fd.get('name') || '').trim()

    if (!newName) {
      showToast('Введите название товара')
      return
    }

    if (newName === product.name) {
      showToast('Название не изменилось')
      return
    }

    const data = new FormData()
    data.append('name', newName)

    try {
      const response = await fetch(
        `${API_URL}/api/wholesale/products/${product.id}`,
        {
          method: 'PATCH',
          headers: {
            'X-Admin-Id': String(tgUser?.id || ''),
          },
          body: data,
        }
      )

      if (!response.ok) {
        throw new Error('Ошибка сохранения')
      }

      await loadWholesaleProducts()
      showToast('Название обновлено')
    } catch {
      showToast('Не удалось сохранить название')
    }
  }}
  style={{
    display: 'grid',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    background: 'rgba(168,85,247,0.06)',
    border: '1px solid rgba(168,85,247,0.18)',
  }}
>
  <div style={{
    fontSize: 14,
    fontWeight: 700,
  }}>
    ✎ Название товара
  </div>

  <input
    name="name"
    defaultValue={product.name}
    placeholder="Введите название"
    maxLength={120}
    required
    style={{
      ...inputStyle,
      marginBottom: 0,
      boxSizing: 'border-box',
    }}
  />

  <button
    type="submit"
    style={{
      ...adminPrimaryBtn,
      width: '100%',
      padding: 13,
    }}
  >
    Сохранить название
  </button>
</form>

    <button
      type="button"
      style={{ ...adminActionBtn, textAlign: 'left' }}
      onClick={() =>
        setScreen(`admin_wholesale_flavors_${product.id}` as any)
      }
    >
      ≡　Вкусы и остатки
    </button>

    <button
      type="button"
      style={{ ...adminActionBtn, textAlign: 'left' }}
      onClick={() =>
        setScreen(`admin_wholesale_tiers_${product.id}` as any)
      }
    >
      €　Оптовые цены
    </button>
  </div>
</div>

<div style={{ ...adminCard, marginBottom: 16 }}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  }}>
    <div>
      <div style={{ fontWeight: 700 }}>
        Видимость товара
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
        {Number(product.is_visible) === 1
          ? 'Покупатели видят товар'
          : 'Товар скрыт от покупателей'}
      </div>
    </div>

    <span style={adminBadge(Number(product.is_visible) === 1)}>
      {Number(product.is_visible) === 1 ? 'ВКЛ' : 'ВЫКЛ'}
    </span>
  </div>

  <button
    type="button"
    style={{ ...adminPrimaryBtn, width: '100%' }}
    onClick={async () => {
      const nextVisible = Number(product.is_visible) === 1 ? 0 : 1
      const fd = new FormData()
      fd.append('is_visible', String(nextVisible))

      try {
        const response = await fetch(
          `${API_URL}/api/wholesale/products/${product.id}`,
          {
            method: 'PATCH',
            headers: { 'X-Admin-Id': String(tgUser?.id || '') },
            body: fd,
          }
        )

        if (!response.ok) throw new Error('Ошибка')

        await loadWholesaleProducts()
        showToast(nextVisible ? 'Товар опубликован' : 'Товар скрыт')
      } catch {
        showToast('Не удалось изменить видимость')
      }
    }}
  >
    {Number(product.is_visible) === 1
      ? 'Скрыть товар'
      : 'Опубликовать товар'}
  </button>
</div>

<button
  type="button"
  onClick={async () => {
    if (!confirm('Удалить товар навсегда?')) return

    const response = await fetch(
      `${API_URL}/api/wholesale/products/${product.id}`,
      {
        method: 'DELETE',
        headers: { 'X-Admin-Id': String(tgUser?.id || '') },
      }
    )

    if (!response.ok) {
      showToast('Не удалось удалить товар')
      return
    }

    await loadWholesaleProducts()
    setScreen(`admin_wholesale_${product.category_id}` as any)
    showToast('Товар удалён')
  }}
  style={{
    ...adminActionBtn,
    width: '100%',
    color: '#ff8585',
    border: '1px solid rgba(255,100,100,0.25)',
  }}
>
  Удалить товар
</button>
        </div>
      <BottomNav />
    </div>
  )
}

  if (screen.startsWith('admin_wholesale_tiers_')) {
  const productId = Number(screen.replace('admin_wholesale_tiers_', ''))
  const product = wholesaleProducts.find(p => p.id === productId)

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button onClick={() => setScreen(`admin_wholesale_product_${productId}` as any)} style={backBtn}>← Назад</button>
        <h2 style={{ margin: '16px 0 16px', fontSize: 22 }}>Цены · {product?.name}</h2>

        {tiers.map(t => (
  <form
    key={t.id}
    onSubmit={async (e) => {
      e.preventDefault()

      const fd = new FormData(e.currentTarget)
      const min = Number(fd.get('min_qty'))
      const cost = Number(fd.get('price'))

      if (
        !Number.isInteger(min) ||
        min < 1 ||
        !Number.isFinite(cost) ||
        cost <= 0
      ) {
        showToast('Проверь количество и цену')
        return
      }

      fd.set('min_qty', String(min))
      fd.set('price', String(cost))

      try {
        const r = await fetch(
          `${API_URL}/api/wholesale/tiers/${t.id}`,
          {
            method: 'PATCH',
            headers: {
              'X-Admin-Id': String(tgUser?.id || ''),
            },
            body: fd,
          }
        )

        if (!r.ok) throw new Error('Ошибка сохранения')

        setTiers(prev => prev.map(item =>
          item.id === t.id
            ? { ...item, min_qty: min, price: cost }
            : item
        ))

        await loadWholesaleProducts()
        showToast('Цена сохранена')
      } catch {
        showToast('Не удалось сохранить цену')
      }
    }}
    style={{
      ...card,
      marginBottom: 12,
      borderRadius: 18,
      border: '1px solid rgba(168,85,247,0.25)',
      padding: 16,
    }}
  >
    <div style={{
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 14,
    }}>
      Ценовой порог
    </div>

    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          color: '#aaa',
          marginBottom: 7,
        }}>
          От количества
        </div>

        <input
          name="min_qty"
          type="number"
          min="1"
          step="1"
          defaultValue={t.min_qty}
          style={inputStyle}
          required
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          color: '#aaa',
          marginBottom: 7,
        }}>
          Цена за шт. (€)
        </div>

        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={t.price}
          style={inputStyle}
          required
        />
      </div>
    </div>

    <div style={{ display: 'flex', gap: 10 }}>
      <button
        type="submit"
        style={{
          ...btnMain,
          flex: 1,
          width: 'auto',
          padding: 12,
          background: '#7c3aed',
          border: 'none',
          fontSize: 13,
        }}
      >
        Сохранить
      </button>

      <button
        type="button"
        onClick={async () => {
          if (!confirm('Удалить этот ценовой порог?')) return

          try {
            const r = await fetch(
              `${API_URL}/api/wholesale/tiers/${t.id}`,
              {
                method: 'DELETE',
                headers: {
                  'X-Admin-Id': String(tgUser?.id || ''),
                },
              }
            )

            if (!r.ok) throw new Error('Ошибка удаления')

            setTiers(prev => prev.filter(
              item => item.id !== t.id
            ))

            await loadWholesaleProducts()
            showToast('Порог удалён')
          } catch {
            showToast('Не удалось удалить порог')
          }
        }}
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid rgba(255,80,80,0.25)',
          background: 'rgba(255,80,80,0.08)',
          color: '#ff8585',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Удалить
      </button>
    </div>
  </form>
))}

        <div style={{ ...card, marginTop: 16 }}>
          <input style={inputStyle} placeholder="От кол-ва (шт)" value={minQty} onChange={e => setMinQty(e.target.value)} />
          <input style={{ ...inputStyle, marginTop: 8 }} placeholder="Цена €" value={price} onChange={e => setPrice(e.target.value)} />
          <button
            onClick={async () => {
              if (!minQty || !price) return
              const fd = new FormData()
              fd.append('min_qty', minQty)
              fd.append('price', price)
              await fetch(`${API_URL}/api/wholesale/products/${productId}/tiers`, {
                method: 'POST',
                body: fd,
              })
              const r = await fetch(`${API_URL}/api/wholesale/products/${productId}/tiers`)
              const d = await r.json()
              setTiers(d.tiers || d || [])
              setMinQty('')
              setPrice('')
            }}
            style={{ ...btnMain, marginTop: 12 }}
          >
            + Добавить порог
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

if (screen.startsWith('admin_wholesale_flavors_')) {
  const productId = Number(screen.replace('admin_wholesale_flavors_', ''))
  const product = wholesaleProducts.find(p => p.id === productId)

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button onClick={() => setScreen(`admin_wholesale_product_${productId}` as any)} style={backBtn}>← Назад</button>
        <h2 style={{ margin: '16px 0 16px', fontSize: 22 }}>Вкусы · {product?.name}</h2>

        {flavors.map(f => (
  <form
    key={f.id}
    onSubmit={async (e) => {
      e.preventDefault()

      const fd = new FormData(e.currentTarget)
      const name = String(fd.get('name') || '').trim()
      const stock = Number(fd.get('stock'))

      if (!name || !Number.isInteger(stock) || stock < 0) {
        showToast('Проверь название и остаток')
        return
      }

      fd.set('name', name)
      fd.set('stock', String(stock))

      try {
        const r = await fetch(
          `${API_URL}/api/wholesale/flavors/${f.id}`,
          {
            method: 'PATCH',
            headers: {
              'X-Admin-Id': String(tgUser?.id || ''),
            },
            body: fd,
          }
        )

        if (!r.ok) throw new Error('Ошибка сохранения')

        setFlavors(prev => prev.map(item =>
          item.id === f.id
            ? { ...item, name, stock }
            : item
        ))

        await loadWholesaleProducts()
        showToast('Изменения сохранены')
      } catch {
        showToast('Не удалось сохранить вкус')
      }
    }}
    style={{
      ...card,
      marginBottom: 12,
      border: '1px solid rgba(168,85,247,0.25)',
      borderRadius: 16,
      padding: 16,
    }}
  >
    <div style={{
      fontWeight: 700,
      fontSize: 15,
      marginBottom: 14,
    }}>
      {f.name}
    </div>

    <div style={{
      fontSize: 12,
      color: '#aaa',
      marginBottom: 6,
    }}>
      Название вкуса
    </div>

    <input
      name="name"
      key={`name-${f.id}`}
      defaultValue={f.name}
      style={inputStyle}
      required
    />

    <div style={{
      fontSize: 12,
      color: '#aaa',
      marginBottom: 6,
    }}>
      Количество в наличии
    </div>

    <input
      name="stock"
      type="number"
      min="0"
      step="1"
      defaultValue={f.stock}
      style={inputStyle}
      required
    />

    <div style={{ display: 'flex', gap: 10 }}>
      <button
        type="submit"
        style={{
          ...btnMain,
          flex: 1,
          background: '#7c3aed',
          border: 'none',
          padding: 12,
          fontSize: 13,
        }}
      >
        Сохранить
      </button>

      <button
        type="button"
        onClick={async () => {
          if (!confirm(`Удалить вкус "${f.name}"?`)) return

          try {
            const r = await fetch(
              `${API_URL}/api/wholesale/flavors/${f.id}`,
              {
                method: 'DELETE',
                headers: {
                  'X-Admin-Id': String(tgUser?.id || ''),
                },
              }
            )

            if (!r.ok) throw new Error('Ошибка удаления')

            setFlavors(prev =>
              prev.filter(item => item.id !== f.id)
            )

            await loadWholesaleProducts()
            showToast('Вкус удалён')
          } catch {
            showToast('Не удалось удалить вкус')
          }
        }}
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid rgba(255,80,80,0.25)',
          background: 'rgba(255,80,80,0.08)',
          color: '#ff8585',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Удалить
      </button>
    </div>
  </form>
))}

        <div style={{ ...card, marginTop: 16 }}>
          <input style={inputStyle} placeholder="Название вкуса" value={flavorName} onChange={e => setFlavorName(e.target.value)} />
          <input style={{ ...inputStyle, marginTop: 8 }} placeholder="Количество" value={flavorStock} onChange={e => setFlavorStock(e.target.value)} />
          <button
            onClick={async () => {
              if (!flavorName.trim()) return
              const fd = new FormData()
              fd.append('name', flavorName)
              fd.append('stock', flavorStock)
              await fetch(`${API_URL}/api/wholesale/products/${productId}/flavors`, {
                method: 'POST',
                body: fd,
              })
              const r = await fetch(`${API_URL}/api/wholesale/products/${productId}/flavors`)
              const d = await r.json()
              setFlavors(d.flavors || d || [])
              setFlavorName('')
              setFlavorStock('0')
            }}
            style={{ ...btnMain, marginTop: 12 }}
          >
            + Добавить вкус
          </button>
        </div>
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

  if (screen === 'retail_product') {
  const product = retailProducts.find(
    p => Number(p.id) === selectedRetailId
  )

  if (!product) {
    return (
      <div style={page}>
        <button style={backBtn} onClick={() => setScreen('catalog')}>
          ← Назад
        </button>
        <div style={card}>Товар не найден</div>
      </div>
    )
  }

  const totalQty = retailFlavors.reduce(
    (sum, f) => sum + (retailQty[f.id] || 0), 0
  )

  const tiers = [...(product.retail_tiers || [])].sort(
    (a: any, b: any) => Number(a.min_qty) - Number(b.min_qty)
  )

  const activeTier = tiers
    .filter((t: any) => totalQty >= Number(t.min_qty))
    .pop()

  const unitPrice = activeTier ? Number(activeTier.price) : 0
  const totalPrice = unitPrice * totalQty

  return (
    <div key={screen} style={page}>
      <RetailTopBar />
      <button
        type="button"
        onClick={() => setScreen('catalog')}
        style={backBtn}
      >
        ← Назад в каталог
      </button>

      <div style={{
        ...adminCard,
        marginBottom: 16,
        textAlign: 'center',
      }}>
        {product.photo_url && (
          <img
            src={photoUrl(product.photo_url) || ''}
            alt={product.name}
            style={{
              width: '100%',
              maxHeight: 240,
              objectFit: 'contain',
              marginBottom: 14,
            }}
          />
        )}

        <div style={{ fontSize: 20, fontWeight: 800 }}>
          {product.name}
        </div>

        <div style={{
          color: '#34d399',
          fontSize: 13,
          marginTop: 10,
        }}>
          В наличии: {product.stock || 0} шт.
        </div>
      </div>

      <div style={adminCard}>
        <div style={{
          fontSize: 17,
          fontWeight: 700,
          marginBottom: 18,
        }}>
          Выберите вкусы
        </div>

        {retailLoading ? (
          <div style={{ color: '#aaa' }}>Загрузка...</div>
        ) : (
          retailFlavors.map(f => {
            const quantity = retailQty[f.id] || 0
            const stock = Number(f.stock) || 0

            return (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {f.name}
                  </div>

                  <div style={{
                    color: stock > 0 ? '#34d399' : '#999',
                    fontSize: 12,
                    marginTop: 6,
                  }}>
                    {stock > 0
                      ? `${stock} шт. в наличии`
                      : 'Нет в наличии'}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #7541ad',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#29183c',
                }}>
                  <button
                    type="button"
                    disabled={quantity === 0}
                    onClick={() =>
                      setRetailQty(prev => ({
                        ...prev,
                        [f.id]: Math.max(0, quantity - 1),
                      }))
                    }
                    style={{
                      width: 44,
                      height: 44,
                      border: 'none',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: 22,
                    }}
                  >
                    −
                  </button>

                  <span style={{
                    minWidth: 35,
                    textAlign: 'center',
                    fontWeight: 800,
                  }}>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    disabled={quantity >= stock}
                    onClick={() =>
                      setRetailQty(prev => ({
                        ...prev,
                        [f.id]: Math.min(stock, quantity + 1),
                      }))
                    }
                    style={{
                      width: 44,
                      height: 44,
                      border: 'none',
                      background: 'rgba(168,85,247,0.2)',
                      color: '#fff',
                      fontSize: 22,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })
        )}

        <div style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: '1px solid #444',
        }}>
          <div style={{
            color: '#aaa',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 14,
          }}>
            Цена за штуку
          </div>

          {tiers.map((tier: any) => (
            <div
              key={tier.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                color: activeTier?.id === tier.id
                  ? '#d8b4fe'
                  : '#aaa',
                fontSize: 13,
              }}
            >
              <span>От {tier.min_qty} шт.</span>
              <strong>{Number(tier.price).toFixed(2)} €</strong>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 22,
          marginBottom: 18,
        }}>
          <strong>{totalQty} шт.</strong>
          <strong style={{
            fontSize: 24,
            color: '#c084fc',
          }}>
            {totalPrice.toFixed(2)} €
          </strong>
        </div>

        <button
          type="button"
          disabled={totalQty === 0 || !activeTier}
          onClick={() => {
  const selected = retailFlavors.filter(
    f => (retailQty[f.id] || 0) > 0
  )

  setRetailCart(prev => {
    const updated = [...prev]

    for (const flavor of selected) {
      const quantity = retailQty[flavor.id] || 0

      const existingIndex = updated.findIndex(
        item =>
          item.productId === Number(product.id) &&
          item.flavorId === Number(flavor.id)
      )

      if (existingIndex >= 0) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(
  Number(flavor.stock) || 0,
  updated[existingIndex].quantity + quantity
),
        }
      } else {
        updated.push({
          productId: Number(product.id),
          productName: product.name,
          flavorId: Number(flavor.id),
          flavorName: flavor.name,
          quantity,
          stock: Number(flavor.stock) || 0,
        })
      }
    }

    return updated
  })

  setRetailQty({})
  showToast('Товары добавлены в корзину')
  setScreen('cart')
}}
          style={{
            ...adminPrimaryBtn,
            width: '100%',
            padding: 16,
            opacity: totalQty > 0 && activeTier ? 1 : 0.5,
          }}
        >
          Добавить выбранное
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
  
  if (screen === 'wholesale_product') {
    const product = wholesaleProducts.find(
      p => Number(p.id) === selectedWholesaleId
    )

    if (!product) {
      return (
        <div style={page}>
          <button
            style={backBtn}
            onClick={() => setScreen('catalog')}
          >
            ← Назад
          </button>
          <div style={card}>Товар не найден</div>
        </div>
      )
    }

    const activeFlavors = wholesaleFlavors.filter(
      f => Number(f.is_visible ?? 1) !== 0
    )

    const sortedTiers = [...wholesaleTiers].sort(
      (a, b) => Number(a.min_qty) - Number(b.min_qty)
    )

    const totalQty = activeFlavors.reduce(
      (sum, f) => sum + (wholesaleQty[Number(f.id)] || 0),
      0
    )

    const image = photoUrl(product.photo_url)

    return (
      <div style={page}>
        <button
          style={backBtn}
          onClick={() => setScreen('catalog')}
        >
          ← Назад
        </button>

        <div style={{ ...card, marginBottom: 16 }}>
          {image && (
            <img
              src={image}
              alt={product.name}
              style={{
                width: '100%',
                borderRadius: 12,
                marginBottom: 16,
                objectFit: 'cover',
              }}
            />
          )}

          <h2 style={{ margin: '0 0 16px' }}>
            {product.name}
          </h2>

          <h3>Выберите вкусы</h3>

          {wholesaleLoading ? (
            <p>Загрузка вкусов...</p>
          ) : activeFlavors.length === 0 ? (
            <p style={{ color: '#aaa' }}>
              Вкусов пока нет
            </p>
          ) : (
            activeFlavors.map(f => {
              const id = Number(f.id)
              const stock = Math.max(0, Number(f.stock) || 0)
              const qty = wholesaleQty[id] || 0

              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 0',
                    borderBottom: '1px solid #333',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {f.name}
                    </div>
                    <div style={{
                      color: '#aaa',
                      fontSize: 12,
                      marginTop: 4,
                    }}>
                      В наличии: {stock} шт.
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <button
  type="button"
  disabled={qty === 0}
  onClick={() => setWholesaleQty(prev => ({
    ...prev,
    [id]: Math.max(0, qty - 1),
  }))}
  style={{
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid rgba(168,85,247,0.45)',
    background: '#272032',
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  }}
>
  −
 </button>
                    <span>{qty}</span>

                    <button
  type="button"
  disabled={qty >= stock}
  onClick={() => setWholesaleQty(prev => ({
    ...prev,
    [id]: Math.min(stock, qty + 1),
  }))}
  style={{
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid rgba(168,85,247,0.45)',
    background: '#272032',
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  }}
>
  +
</button>
                  </div>
                </div>
              )
            })
          )}

          <h3 style={{ marginTop: 24 }}>
            Оптовые цены
          </h3>

          {sortedTiers.map(t => (
            <div
              key={t.id ?? t.min_qty}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                color: '#ddd',
              }}
            >
              <span>От {t.min_qty} шт.</span>
              <strong>
                {Number(t.price).toFixed(2)} €/шт.
              </strong>
            </div>
          ))}

          <div style={{
            borderTop: '1px solid #444',
            marginTop: 20,
            paddingTop: 16,
          }}>
            <div>Выбрано: {totalQty} шт.</div>

            <div style={{ marginTop: 12 }}>
  <button
    type="button"
    onClick={() => {
  const selectedFlavors = wholesaleFlavors
    .filter(f => Number(wholesaleQty[Number(f.id)] || 0) > 0)
    .map(f => ({
      productId: Number(product.id),
      productName: String(product.name),
      flavorId: Number(f.id),
      flavorName: String(f.name),
      quantity: Number(wholesaleQty[Number(f.id)]),
    }))

  if (selectedFlavors.length > 0) {
    setWholesaleCart(prev => [
      ...prev.filter(item => item.productId !== Number(product.id)),
      ...selectedFlavors,
    ])
  }

  setScreen('cart')
}}
    style={{
      ...btnMain,
      width: '100%',
      padding: 16,
    }}
  >
    Перейти в корзину ({wholesaleCart.reduce((sum, item) => sum + item.quantity, 0) + totalQty} шт.)
  </button>
  <p style={{
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
  }}>
    Итоговая стоимость рассчитывается в корзине
  </p>
</div>
          </div>
        </div>
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
  const name = tgUser?.first_name || 'Клиент'
  const letter = name.charAt(0).toUpperCase()
  const photo = (tgUser as any)?.photo_url || null

  return (
    <div key={screen} style={page}>
      {/* Верхняя часть с градиентом на всю ширину */}
      <div style={{
  background: 'linear-gradient(90deg, #2e1065, #7c3aed)',
  padding: '28px 20px 36px',
  margin: '-16px -16px 20px -16px',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
}}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#1a1a1a',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>
          {photo ? (
            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            letter
          )}
        </div>

        <div>
          <div style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            {name}
            <span style={{ fontSize: 14, color: '#a3a3a3', fontWeight: 500 }}>
              M-{String(profile?.id || 0).padStart(3, '0')}
            </span>
          </div>
          {tgUser?.username && (
            <div style={{ color: '#a3a3a3', fontSize: 14, marginTop: 2 }}>
              @{tgUser.username}
            </div>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
          <div style={{ color: '#a3a3a3', fontSize: 13 }}>Покупок</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{profile?.purchases || 0}</div>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
          <div style={{ color: '#a3a3a3', fontSize: 13 }}>Друзей</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{profile?.referrals || 0}</div>
        </div>
      </div>

      {/* Скидка */}
<div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <div style={{ color: '#a3a3a3', fontSize: 13 }}>Скидка</div>
    <div style={{ fontSize: 20, fontWeight: 700 }}>
      {profile?.has_discount ? 'Да' : 'Нет'}
    </div>
  </div>
  <button
    onClick={() => setShowDiscountInfo(true)}
    style={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      border: '1px solid #444',
      background: 'transparent',
      color: '#a3a3a3',
      fontSize: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    ?
  </button>
</div>

      {/* Реферальная ссылка */}
      <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 8 }}>Реферальная ссылка</div>
        <div
          onClick={() => {
            const link = `https://t.me/itsmono_bot?start=ref_${tgUser?.id || ''}`
            navigator.clipboard.writeText(link)
            alert('Ссылка скопирована')
          }}
          style={{
            background: '#111',
            borderRadius: 12,
            padding: 12,
            fontSize: 13,
            wordBreak: 'break-all',
            cursor: 'pointer',
          }}
        >
          https://t.me/itsmono_bot?start=ref_{tgUser?.id || ''}
        </div>
        <div style={{ color: '#6b6b6b', fontSize: 12, marginTop: 6 }}>Нажми, чтобы скопировать</div>
      </div>

      {showDiscountInfo && (
  <div
    onClick={() => setShowDiscountInfo(false)}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20,
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        maxWidth: 320,
        width: '100%',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Как работает скидка</div>
      <div style={{ color: '#a3a3a3', fontSize: 14, lineHeight: 1.4 }}>
        Пригласите 2 друзей по своей реферальной ссылке.<br />
        После того как они оформят заказ, вам активируется скидка 5 € на следующий заказ.
      </div>
      <button
        onClick={() => setShowDiscountInfo(false)}
        style={{
          marginTop: 16,
          width: '100%',
          background: '#2563eb',
          border: 0,
          borderRadius: 12,
          padding: 12,
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Понятно
      </button>
    </div>
  </div>
)}
      
      <BottomNav />
    </div>
  )
}

 if (screen === 'delivery') {
  return (
    <div key={screen} style={page}>
      <button onClick={() => setScreen('catalog')} style={backBtn}>Назад</button>
      <div style={{ ...title, marginBottom: 20 }}>Способы получения</div>

      <button
        onClick={() => { setDeliveryType('pickup'); setScreen('catalog') }}
        style={{
          ...card,
          width: '100%',
          textAlign: 'left',
          marginBottom: 12,
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Самовывоз</div>
        </div>
        <div style={{ fontSize: 14, color: '#a0a0a0', lineHeight: 1.5 }}>
          Для оформления самовывоза предварительно свяжитесь с менеджером через поддержку.
        </div>
      </button>

      <button
        onClick={() => { setDeliveryType('delivery'); setScreen('catalog') }}
        style={{
          ...card,
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <path d="M3.27 6.96L12 12.01l8.73-5.05"/>
            <path d="M12 22.08V12"/>
          </svg>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Доставка</div>
        </div>
        <div style={{ fontSize: 14, color: '#a0a0a0', lineHeight: 1.5 }}>
          Самовывоз недоступен в вашем городе? Закажите по почте!
        </div>
      </button>
    </div>
  )
}

  if (screen === 'conditions') {
  return (
    <div key="conditions" style={page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button type="button" onClick={() => setScreen('catalog')} style={{ border: 'none', background: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>←</button>
        <div style={title}>Условия работы</div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📦 Минимальный заказ и ассортимент</div>
        <div style={{ fontSize: 13, color: '#d0d0d0', lineHeight: 1.5 }}>
          Мы работаем с любыми объёмами — как с небольшими заказами, так и с супер крупными партиями.
          <br /><br />
          Вы можете свободно миксовать товары между собой — любые бренды, типы и вкусы (жидкости, одноразки и др.).
          <br /><br />
          Главное условие — соблюдение минимального общего количества для отгрузки:
          <br />• от 20 шт — первая ценовая категория;
          <br />• цены для крупных объёмов доступны по запросу.
          <br /><br />
          📌 Картриджи для подсистем не участвуют в подсчёте минимального количества.
          <br /><br />
          Минимальное количество считается только по жидкостям, подсистемам и одноразкам.
        </div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📦 Доставка по Европе</div>
        <div style={{ fontSize: 13, color: '#d0d0d0', lineHeight: 1.5 }}>
          Служба: DPD / GLS
          <br />Сроки: в среднем от 3 до 5 рабочих дней
          <br />20–40 €
          <br /><br />
          Точная стоимость зависит от веса и количества.
        </div>
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>💳 Оплата</div>
        <div style={{ fontSize: 13, color: '#d0d0d0', lineHeight: 1.5 }}>
          Мы предлагаем несколько способов оплаты:
          <br /><br />
          🅣 USDT (криптовалюта) — предпочтительный способ расчёта.
          <br />💶 Банковский перевод в UAH — на Украинский счёт.
        </div>
      </div>
    </div>
  )
}

  if (screen === 'wholesale_checkout') {
  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button
          type="button"
          style={backBtn}
          onClick={() => setScreen('cart')}
        >
          ← Назад в корзину
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{ margin: 0, fontSize: 23 }}>
            Контактные данные
          </h2>
          <span style={adminBadge(true)}>1 / 4</span>
        </div>

        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
        }}>
          {[1, 2, 3, 4].map(step => (
            <div key={step} style={{
              flex: 1,
              height: 5,
              borderRadius: 99,
              background: step === 1
                ? '#8b5cf6'
                : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>

        <form
          onSubmit={e => {
  e.preventDefault()

  const data = new FormData(e.currentTarget)

  setWholesaleContact({
    first_name: String(data.get('first_name') || '').trim(),
    last_name: String(data.get('last_name') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    email: String(data.get('email') || '').trim(),
  })

  setScreen('wholesale_delivery')
}}
        >
          <div style={{
            background: '#262629',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 17,
            padding: 16,
          }}>
            <div style={{
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 20,
            }}>
              ♙ Введите данные
            </div>

            <div style={{ marginBottom: 16 }}>
  <label style={{
    display: 'block',
    color: '#b8a8dc',
    fontSize: 13,
    marginBottom: 8,
  }}>
    Страна *
  </label>

  <select
    value={wholesaleCountry}
    onChange={e => {
      const country = e.target.value

      setWholesaleCountry(country)
      setWholesaleCarrier('')

      setWholesaleContact(prev => ({
        ...prev,
        phone: WHOLESALE_DIAL_CODES[country] || '',
      }))
    }}
    style={{
      ...inputStyle,
      background: '#161616',
      width: '100%',
      boxSizing: 'border-box',
      padding: 14,
      marginBottom: 0,
    }}
  >
    {[
      ['PL', 'Польша'],
      ['AT', 'Австрия'],
      ['BE', 'Бельгия'],
      ['BG', 'Болгария'],
      ['HU', 'Венгрия'],
      ['DE', 'Германия'],
      ['GR', 'Греция'],
      ['DK', 'Дания'],
      ['IE', 'Ирландия'],
      ['ES', 'Испания'],
      ['IT', 'Италия'],
      ['CY', 'Кипр'],
      ['LV', 'Латвия'],
      ['LT', 'Литва'],
      ['LU', 'Люксембург'],
      ['MT', 'Мальта'],
      ['NL', 'Нидерланды'],
      ['PT', 'Португалия'],
      ['RO', 'Румыния'],
      ['SK', 'Словакия'],
      ['SI', 'Словения'],
      ['FI', 'Финляндия'],
      ['FR', 'Франция'],
      ['HR', 'Хорватия'],
      ['CZ', 'Чехия'],
      ['SE', 'Швеция'],
      ['EE', 'Эстония'],
    ].map(([code, name]) => (
      <option key={code} value={code}>
        {name}
      </option>
    ))}
  </select>
</div>
            
            {[
              {
                name: 'first_name',
                label: 'Имя',
                placeholder: 'Ваше имя',
                type: 'text',
                value: wholesaleContact.first_name,
              },
              {
                name: 'last_name',
                label: 'Фамилия',
                placeholder: 'Ваша фамилия',
                type: 'text',
                value: wholesaleContact.last_name,
              },
              {
                name: 'phone',
                label: 'Телефон',
                placeholder: '+49...',
                type: 'tel',
                value: wholesaleContact.phone,
              },
              {
                name: 'email',
                label: 'Email',
                placeholder: 'your@email.com',
                type: 'email',
                value: wholesaleContact.email,
              },
            ].map(field => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  color: '#b8a8dc',
                  fontSize: 13,
                  marginBottom: 8,
                }}>
                  {field.label} *
                </label>

                <input
                  name={field.name}
                  type={field.type}
                  value={field.name === 'phone' ? wholesaleContact.phone : undefined}
defaultValue={field.name !== 'phone' ? field.value : undefined}
onChange={field.name === 'phone'
  ? e => setWholesaleContact(prev => ({ ...prev, phone: e.target.value }))
  : undefined}
                  placeholder={field.placeholder}
                  required
                  style={{
                    ...inputStyle,
                    background: '#161616',
                    boxSizing: 'border-box',
                    marginBottom: 0,
                    padding: 14,
                  }}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            style={{
              ...adminPrimaryBtn,
              width: '100%',
              marginTop: 18,
              padding: 16,
              fontSize: 15,
            }}
          >
            Далее
          </button>
        </form>
      </div>
    </div>
  )
}

  if (screen === 'wholesale_delivery') {
  const countries = [
  ['PL', 'Польша'],
  ['AT', 'Австрия'],
  ['BE', 'Бельгия'],
  ['BG', 'Болгария'],
  ['HU', 'Венгрия'],
  ['DE', 'Германия'],
  ['GR', 'Греция'],
  ['DK', 'Дания'],
  ['IE', 'Ирландия'],
  ['ES', 'Испания'],
  ['IT', 'Италия'],
  ['CY', 'Кипр'],
  ['LV', 'Латвия'],
  ['LT', 'Литва'],
  ['LU', 'Люксембург'],
  ['MT', 'Мальта'],
  ['NL', 'Нидерланды'],
  ['PT', 'Португалия'],
  ['RO', 'Румыния'],
  ['SK', 'Словакия'],
  ['SI', 'Словения'],
  ['FI', 'Финляндия'],
  ['FR', 'Франция'],
  ['HR', 'Хорватия'],
  ['CZ', 'Чехия'],
  ['SE', 'Швеция'],
  ['EE', 'Эстония'],
]

  const deliveryField = {
    ...inputStyle,
    width: '100%',
    boxSizing: 'border-box' as const,
    background: '#161616',
    marginBottom: 0,
    padding: 14,
  }

  const deliveryLabel = {
    display: 'block',
    color: '#b8a8dc',
    fontSize: 13,
    marginBottom: 8,
  }

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button
          type="button"
          style={backBtn}
          onClick={() => setScreen('wholesale_checkout')}
        >
          ← Назад
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{ margin: 0, fontSize: 23 }}>
            Доставка
          </h2>

          <span style={adminBadge(true)}>
            2 / 4
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
        }}>
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 99,
                background: step <= 2
                  ? '#8b5cf6'
                  : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()

            if (!wholesaleCarrier) {
              showToast('Выберите службу доставки')
              return
            }

            if (
              wholesaleCarrier === 'GLS' &&
              wholesaleCountry !== 'DE'
            ) {
              showToast('GLS доступен только по Германии')
              return
            }

            const fd = new FormData(e.currentTarget)

            const address = {
              city: String(fd.get('city') || '').trim(),
              postal_code: String(fd.get('postal_code') || '').trim(),
              street: String(fd.get('street') || '').trim(),
              house: String(fd.get('house') || '').trim(),
            }

            if (Object.values(address).some(value => !value)) {
              showToast('Заполните адрес доставки')
              return
            }

            setWholesaleAddress(address)
            setScreen('wholesale_review')
          }}
        >
          <div style={{
            background: '#262629',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 17,
            padding: 16,
          }}>
            <div style={{
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 20,
            }}>
              🚚 Доставка
            </div>

            <div style={{ marginBottom: 18 }}>
  <div style={{
    color: '#b8a8dc',
    fontSize: 13,
    marginBottom: 8,
  }}>
    Страна доставки
  </div>

  <div style={{
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }}>
    <span style={{ fontSize: 18 }}>📍</span>

    <span style={{
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
    }}>
      {countries.find(
        ([code]) => code === wholesaleCountry
      )?.[1] || 'Страна не выбрана'}
    </span>
  </div>

  <div style={{
    color: '#888',
    fontSize: 11,
    marginTop: 7,
  }}>
    Изменить страну можно на предыдущем шаге
  </div>
</div>

            <div style={{ marginBottom: 18 }}>
              <label style={deliveryLabel}>
                Способ доставки *
              </label>

              <select
                value={wholesaleCarrier}
                onChange={e =>
                  setWholesaleCarrier(e.target.value)
                }
                style={deliveryField}
                required
              >
                <option value="">
                  Выберите способ доставки
                </option>

                <option value="DPD">
                  DPD — доставка по Европе
                </option>

                {wholesaleCountry === 'DE' && (
                  <option value="GLS">
                    GLS — доставка по Германии
                  </option>
                )}
              </select>
            </div>

            {wholesaleCarrier && (
              <div style={{
                padding: 12,
                borderRadius: 12,
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.2)',
                color: '#d8b4fe',
                fontSize: 12,
                lineHeight: 1.6,
                marginBottom: 18,
              }}>
                Выбрана доставка {wholesaleCarrier}.
                Стоимость рассчитывается индивидуально
                в зависимости от страны и веса посылки.
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: 10,
              marginBottom: 18,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={deliveryLabel}>
                  Город *
                </label>

                <input
                  name="city"
                  defaultValue={wholesaleAddress.city}
                  placeholder="Город"
                  style={deliveryField}
                  required
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={deliveryLabel}>
                  Почтовый индекс *
                </label>

                <input
                  name="postal_code"
                  defaultValue={wholesaleAddress.postal_code}
                  placeholder="Индекс"
                  style={deliveryField}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={deliveryLabel}>
                Улица *
              </label>

              <input
                name="street"
                defaultValue={wholesaleAddress.street}
                placeholder="Название улицы"
                style={deliveryField}
                required
              />
            </div>

            <div>
              <label style={deliveryLabel}>
                Номер дома / квартиры *
              </label>

              <input
                name="house"
                defaultValue={wholesaleAddress.house}
                placeholder="Например, 12A, кв. 3"
                style={deliveryField}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...adminPrimaryBtn,
              width: '100%',
              marginTop: 18,
              padding: 16,
              fontSize: 15,
            }}
          >
            Далее
          </button>
        </form>

        <div style={{
          color: '#777',
          fontSize: 12,
          textAlign: 'center',
          marginTop: 18,
        }}>
          Прототип · Заказ пока не отправляется
        </div>
      </div>
    </div>
  )
}

  if (screen === 'wholesale_review') {
  const count = wholesaleCart.reduce(
    (sum, item) => sum + item.quantity, 0
  )

  const rows = wholesaleCart.map(item => {
    const product = wholesaleProducts.find(
      p => Number(p.id) === item.productId
    )

    const prices = [...(product?.wholesale_tiers || [])]
      .sort((a: any, b: any) =>
        Number(a.min_qty) - Number(b.min_qty)
      )

    const available = prices.filter(
      (t: any) => count >= Number(t.min_qty)
    )

    const tier = available.length
      ? available[available.length - 1]
      : prices[0]

    const unitPrice = tier ? Number(tier.price) : 0

    return {
      ...item,
      unitPrice,
      subtotal: unitPrice * item.quantity,
      hasPrice: !!tier,
    }
  })

  const total = rows.reduce(
    (sum, item) => sum + item.subtotal, 0
  )

  const countryNames: Record<string, string> = {
    PL: 'Польша', AT: 'Австрия', BE: 'Бельгия',
    BG: 'Болгария', HU: 'Венгрия', DE: 'Германия',
    GR: 'Греция', DK: 'Дания', IE: 'Ирландия',
    ES: 'Испания', IT: 'Италия', CY: 'Кипр',
    LV: 'Латвия', LT: 'Литва', LU: 'Люксембург',
    MT: 'Мальта', NL: 'Нидерланды', PT: 'Португалия',
    RO: 'Румыния', SK: 'Словакия', SI: 'Словения',
    FI: 'Финляндия', FR: 'Франция', HR: 'Хорватия',
    CZ: 'Чехия', SE: 'Швеция', EE: 'Эстония',
  }

  const sectionStyle = {
    background: '#262629',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 17,
    padding: 16,
    marginBottom: 14,
  }

  const detailStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
    fontSize: 13,
  }

  return (
    <div key={screen} style={page}>
      <div style={{ padding: '16px 16px 90px' }}>
        <button
          type="button"
          style={backBtn}
          onClick={() => setScreen('wholesale_delivery')}
        >
          ← Назад
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <h2 style={{ margin: 0, fontSize: 23 }}>
            Проверка заказа
          </h2>
          <span style={adminBadge(true)}>3 / 4</span>
        </div>

        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
        }}>
          {[1, 2, 3, 4].map(step => (
            <div key={step} style={{
              flex: 1,
              height: 5,
              borderRadius: 99,
              background: step <= 3
                ? '#8b5cf6'
                : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>

        <div style={sectionStyle}>
          <div style={{
            fontSize: 17,
            fontWeight: 700,
            marginBottom: 20,
          }}>
            📦 Ваш заказ
          </div>

          <div style={{
            background: '#111',
            borderRadius: 14,
            padding: 14,
          }}>
            <div style={{
              color: '#b8a8dc',
              fontSize: 12,
              marginBottom: 14,
            }}>
              Контактные данные
            </div>

            <div style={detailStyle}>
              <span style={{ color: '#aaa' }}>Имя</span>
              <strong>
                {wholesaleContact.first_name}{' '}
                {wholesaleContact.last_name}
              </strong>
            </div>

            <div style={detailStyle}>
              <span style={{ color: '#aaa' }}>Телефон</span>
              <strong>{wholesaleContact.phone}</strong>
            </div>

            <div style={detailStyle}>
              <span style={{ color: '#aaa' }}>Email</span>
              <strong style={{ overflowWrap: 'anywhere' }}>
                {wholesaleContact.email}
              </strong>
            </div>

            <hr style={{ borderColor: '#333', margin: '18px 0' }}/>

            <div style={detailStyle}>
              <span style={{ color: '#aaa' }}>Доставка</span>
              <strong>{wholesaleCarrier}</strong>
            </div>

            <div style={{
              color: '#b8a8dc',
              fontSize: 12,
              marginBottom: 8,
            }}>
              Адрес получения
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              {wholesaleAddress.street}{' '}
              {wholesaleAddress.house}
              <div style={{ color: '#aaa' }}>
                {wholesaleAddress.postal_code}{' '}
                {wholesaleAddress.city}
              </div>
              <div style={{ color: '#aaa' }}>
                {countryNames[wholesaleCountry] || wholesaleCountry}
              </div>
            </div>

            <hr style={{ borderColor: '#333', margin: '18px 0' }}/>

            <div style={{
              color: '#b8a8dc',
              fontSize: 12,
              marginBottom: 12,
            }}>
              Товары ({count} шт.)
            </div>

            {rows.map(item => (
              <div
                key={`${item.productId}-${item.flavorId}`}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid #252525',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {item.productName}
                </div>

                <div style={{
                  color: '#aaa',
                  fontSize: 12,
                  marginTop: 4,
                }}>
                  {item.flavorName}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: 13,
                }}>
                  <span>
                    {item.quantity} × {item.unitPrice.toFixed(2)} €
                  </span>
                  <strong>
                    {item.hasPrice
                      ? `${item.subtotal.toFixed(2)} €`
                      : 'Цена не задана'}
                  </strong>
                </div>
              </div>
            ))}

            <hr style={{ borderColor: '#333', margin: '18px 0' }}/>

            <div style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 14,
            }}>
              Способ оплаты
            </div>

            {[
              { id: 'USDT', label: 'Крипта · USDT', icon: '◇' },
              { id: 'UAH', label: 'Карта UAH', icon: '▣' },
            ].map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() =>
                  setWholesalePayment(method.id as 'USDT' | 'UAH')
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '16px 12px',
                  marginBottom: 10,
                  borderRadius: 12,
                  border: wholesalePayment === method.id
                    ? '1px solid #a855f7'
                    : '1px solid #4b3b5d',
                  background: wholesalePayment === method.id
                    ? 'rgba(168,85,247,0.15)'
                    : '#211827',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  color: '#c084fc',
                  fontSize: 22,
                }}>
                  {method.icon}
                </span>

                <strong style={{ flex: 1 }}>
                  {method.label}
                </strong>

                <span style={{
                  color: '#c084fc',
                  fontSize: 22,
                }}>
                  {wholesalePayment === method.id ? '◉' : '○'}
                </span>
              </button>
            ))}

            <div style={{
              color: '#b8a8dc',
              fontSize: 12,
              lineHeight: 1.7,
              marginTop: 12,
            }}>
              Оплата на этом этапе не производится.
              Выбор способа оплаты не списывает деньги.
            </div>

            <hr style={{ borderColor: '#333', margin: '18px 0' }}/>

            <div style={detailStyle}>
              <span style={{ color: '#aaa' }}>
                Стоимость товаров
              </span>
              <strong>{total.toFixed(2)} €</strong>
            </div>

            <div style={detailStyle}>
              <span style={{ color: '#aaa' }}>
                Доставка
              </span>
              <span style={{ color: '#c084fc' }}>
                Рассчитывается индивидуально
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              borderTop: '1px solid #333',
              paddingTop: 16,
            }}>
              <strong>Итого без доставки</strong>
              <strong style={{
                color: '#a855f7',
                fontSize: 21,
              }}>
                {total.toFixed(2)} €
              </strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={
            !wholesalePayment ||
            count < 20 ||
            rows.some(item => !item.hasPrice)
          }
          onClick={() =>
            showToast('Следующий шаг — экран подтверждения')
          }
          style={{
            ...adminPrimaryBtn,
            width: '100%',
            padding: 16,
            fontSize: 15,
            opacity: wholesalePayment && count >= 20 ? 1 : 0.5,
          }}
        >
          Продолжить
        </button>

        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#888',
          marginTop: 14,
        }}>
          Прототип — заказ пока не создаётся и не оплачивается
        </div>
      </div>
    </div>
  )
}

  if (screen === 'retail_checkout') {
  const retailCount = retailCart.reduce(
    (sum, item) => sum + item.quantity, 0
  )

  const getRetailPrice = (productId: number) => {
    const product = retailProducts.find(
      p => Number(p.id) === productId
    )

    const quantity = retailCart
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0)

    const tier = [...(product?.retail_tiers || [])]
      .filter((t: any) => quantity >= Number(t.min_qty))
      .sort((a: any, b: any) =>
        Number(b.min_qty) - Number(a.min_qty)
      )[0]

    return tier ? Number(tier.price) : null
  }

  const hasMissingPrices = retailCart.some(
    item => getRetailPrice(item.productId) === null
  )

  const retailTotal = retailCart.reduce(
    (sum, item) =>
      sum + (getRetailPrice(item.productId) ?? 0) * item.quantity,
    0
  )

  return (
    <div key={screen} style={page}>
      <RetailTopBar />
      <button
        type="button"
        style={backBtn}
        onClick={() => setScreen('cart')}
      >
        ← Назад в корзину
      </button>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>
          Оформление заказа
        </h2>

      </div>

      <div style={{ ...adminCard, marginBottom: 16 }}>
        <div style={{
          fontSize: 17,
          fontWeight: 700,
          marginBottom: 16,
        }}>
          Ваш заказ
        </div>

        {retailCart.map(item => {
          const price = getRetailPrice(item.productId)

          return (
            <div
              key={`${item.productId}-${item.flavorId}`}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #333',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {item.productName}
              </div>

              <div style={{
                color: '#aaa',
                fontSize: 12,
                marginTop: 5,
              }}>
                {item.flavorName}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                fontSize: 13,
              }}>
                <span>{item.quantity} шт.</span>
                <strong>
                  {price === null
                    ? 'Цена не задана'
                    : `${(price * item.quantity).toFixed(2)} €`}
                </strong>
              </div>
            </div>
          )
        })}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 20,
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 700 }}>Товары</div>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              {retailCount} шт.
            </div>
          </div>

          <strong style={{ color: '#c084fc', fontSize: 23 }}>
            {hasMissingPrices
              ? '—'
              : `${retailTotal.toFixed(2)} €`}
          </strong>
        </div>
      </div>

      {deliveryType === 'pickup' ? (
        <div style={{ ...adminCard, marginBottom: 16 }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
          }}>
            📍 Самовывоз
          </div>

          <p style={{
            color: '#c6b8d4',
            fontSize: 14,
            lineHeight: 1.7,
          }}>
            Свяжитесь с менеджером, чтобы уточнить
            доступные города самовывоза и согласовать
            место получения заказа.
          </p>

          <div style={{
            margin: '16px 0',
            color: '#34d399',
            fontSize: 13,
          }}>
            Доплата за доставку отсутствует
          </div>

          <button
            type="button"
            onClick={() =>
              window.open('https://t.me/optpuffy', '_blank')
            }
            style={{
              ...adminPrimaryBtn,
              width: '100%',
              padding: 16,
            }}
          >
            Написать менеджеру
          </button>

          <p style={{
            color: '#999',
            fontSize: 12,
            lineHeight: 1.6,
            marginTop: 14,
          }}>
            Место получения и способ оплаты согласовываются
            с менеджером. Само открытие чата не создаёт заказ.
          </p>
        </div>
      ) : (
        <div style={{ ...adminCard, marginBottom: 16 }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
          }}>
            🚚 Доставка GLS
          </div>

          <div style={{
            color: '#aaa',
            fontSize: 13,
            marginBottom: 14,
          }}>
            Страна доставки: Германия
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 14,
          }}>
            <span>Стоимость доставки</span>
            <strong style={{ color: '#c084fc' }}>
              {retailCount <= 10
                ? 'От 5,89 €'
                : 'Индивидуальный расчёт'}
            </strong>
          </div>

          <p style={{
            color: '#999',
            fontSize: 12,
            lineHeight: 1.7,
            marginTop: 16,
          }}>
            Точная стоимость зависит от посылки.
            В указанную сумму товаров доставка не включена.
          </p>

          <div style={{
  marginTop: 22,
  paddingTop: 18,
  borderTop: '1px solid rgba(255,255,255,0.12)',
}}>
  {retailDeliverySaved ? (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{
        color: '#d8b4fe',
        fontWeight: 700,
        fontSize: 17,
      }}>
        ✓ Данные получателя заполнены
      </div>

      <div style={{
        background: '#17131d',
        borderRadius: 12,
        padding: 14,
        lineHeight: 1.8,
        fontSize: 13,
      }}>
        <strong>
          {retailDeliveryData.firstName} {retailDeliveryData.lastName}
        </strong>
        <div>{retailDeliveryData.phone}</div>
        <div>{retailDeliveryData.email}</div>
        <div style={{ marginTop: 8 }}>
          {retailDeliveryData.street} {retailDeliveryData.house}
          {retailDeliveryData.apartment
            ? `, кв. ${retailDeliveryData.apartment}`
            : ''}
        </div>
        <div>
          {retailDeliveryData.postalCode} {retailDeliveryData.city}
        </div>
        <div>Германия · GLS</div>
      </div>

      <button
        type="button"
        onClick={() => setRetailDeliverySaved(false)}
        style={{ ...adminActionBtn, width: '100%' }}
      >
        Изменить данные
      </button>
    </div>
  ) : (
    <form
      onSubmit={e => {
        e.preventDefault()

        const fd = new FormData(e.currentTarget)
        const get = (key: string) =>
          String(fd.get(key) || '').trim()

        const data = {
          firstName: get('firstName'),
          lastName: get('lastName'),
          phone: get('phone'),
          email: get('email'),
          city: get('city'),
          postalCode: get('postalCode'),
          street: get('street'),
          house: get('house'),
          apartment: get('apartment'),
        }

        if (
          !data.firstName ||
          !data.lastName ||
          !data.phone ||
          !data.email ||
          !data.city ||
          !data.postalCode ||
          !data.street ||
          !data.house
        ) {
          showToast('Заполните обязательные поля')
          return
        }

        if (!/^\+49[0-9\s()-]{6,18}$/.test(data.phone)) {
          showToast('Проверьте номер телефона Германии')
          return
        }

        setRetailDeliveryData(data)
        setRetailDeliverySaved(true)
        showToast('Контакты и адрес заполнены')
      }}
      style={{ display: 'grid', gap: 14 }}
    >
      <div style={{
        fontSize: 17,
        fontWeight: 800,
        marginBottom: 4,
      }}>
        Контактные данные
      </div>

      {[
        ['firstName', 'Имя', 'Ваше имя', 'text'],
        ['lastName', 'Фамилия', 'Ваша фамилия', 'text'],
        ['phone', 'Телефон', '+49...', 'tel'],
        ['email', 'Email', 'example@mail.com', 'email'],
      ].map(([name, label, placeholder, type]) => (
        <label key={name} style={{ display: 'grid', gap: 7 }}>
          <span style={{ fontSize: 13, color: '#c6b8d4' }}>
            {label} *
          </span>
          <input
            name={name}
            type={type}
            defaultValue={
              retailDeliveryData[name as keyof typeof retailDeliveryData]
            }
            placeholder={placeholder}
            required
            style={{ ...inputStyle, marginBottom: 0, boxSizing: 'border-box' }}
          />
        </label>
      ))}

      {retailCheckoutStep === 2 && (
  <>
      <div style={{
        fontSize: 17,
        fontWeight: 800,
        marginTop: 8,
      }}>
        Адрес доставки
      </div>

      <div style={{
        background: 'rgba(168,85,247,0.08)',
        border: '1px solid rgba(168,85,247,0.2)',
        padding: 13,
        borderRadius: 12,
        fontSize: 13,
      }}>
        Германия · Доставка GLS
      </div>

      {[
        ['city', 'Город', 'Например, Stuttgart', true],
        ['postalCode', 'Почтовый индекс', 'Например, 70173', true],
        ['street', 'Улица', 'Название улицы', true],
        ['house', 'Номер дома', 'Например, 12A', true],
        ['apartment', 'Квартира / дополнение', 'Необязательно', false],
      ].map(([name, label, placeholder, required]) => (
        <label key={String(name)} style={{ display: 'grid', gap: 7 }}>
          <span style={{ fontSize: 13, color: '#c6b8d4' }}>
            {label}{required ? ' *' : ''}
          </span>
          <input
            name={String(name)}
            defaultValue={
              retailDeliveryData[
                String(name) as keyof typeof retailDeliveryData
              ]
            }
            placeholder={String(placeholder)}
            required={Boolean(required)}
            style={{ ...inputStyle, marginBottom: 0, boxSizing: 'border-box' }}
          />
        </label>
      ))}
    </>
      )}

      <button
        type="submit"
        style={{
          ...adminPrimaryBtn,
          width: '100%',
          padding: 16,
          marginTop: 8,
        }}
      >
        Сохранить и проверить данные
      </button>
    </form>
  )}
</div>
</div>
)}          

      <BottomNav />
    </div>
  )
}
  
  if (screen === 'cart') {
  const retailTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const wholesaleCount = wholesaleCart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const wholesaleRows = wholesaleCart.map(item => {
    const product = wholesaleProducts.find(
      p => Number(p.id) === item.productId
    )

    const tiers = [...(product?.wholesale_tiers || [])]
      .sort((a: any, b: any) =>
        Number(a.min_qty) - Number(b.min_qty)
      )

    const applicable = tiers.filter(
      (t: any) => wholesaleCount >= Number(t.min_qty)
    )

    const tier = applicable.length
      ? applicable[applicable.length - 1]
      : tiers[0]

    const unitPrice = tier ? Number(tier.price) : 0

    return {
      ...item,
      unitPrice,
      subtotal: unitPrice * item.quantity,
      hasPrice: !!tier,
    }
  })

  const wholesaleTotal = wholesaleRows.reduce(
    (sum, item) => sum + item.subtotal,
    0
  )

  const changeRetailQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(item => item.product.id === id
        ? { ...item, quantity: item.quantity + delta }
        : item
      )
      .filter(item => item.quantity > 0)
    )
  }

  const changeWholesaleQty = (flavorId: number, delta: number) => {
    setWholesaleCart(prev => prev
      .map(item => item.flavorId === flavorId
        ? { ...item, quantity: item.quantity + delta }
        : item
      )
      .filter(item => item.quantity > 0)
    )
  }

  return (
    <div key={screen} style={page}>
      <RetailTopBar wholesale={priceMode === 'wholesale'} />
      <div style={title}>Корзина</div>

      {cart.length === 0 && retailCart.length === 0 && wholesaleCart.length === 0 && (
        <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '65px 20px',
  textAlign: 'center',
}}>
  <div style={{
    width: 108,
    height: 108,
    borderRadius: '50%',
    background: 'rgba(168,85,247,0.10)',
    border: '1px solid rgba(168,85,247,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  }}>
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      style={{ transform: 'translate(-3px, 2px)' }}
      fill="none"
      stroke="#a855f7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  </div>

  <div style={{
    fontSize: 21,
    fontWeight: 700,
    marginBottom: 10,
  }}>
    Корзина пуста
  </div>

  <div style={{
    color: '#999',
    fontSize: 13,
    lineHeight: 1.6,
  }}>
    Добавьте товары из каталога,
    чтобы они появились здесь
  </div>

  <button
    type="button"
    onClick={() => setScreen('catalog')}
    style={{
      ...adminPrimaryBtn,
      flex: 'none',
      marginTop: 24,
      padding: '13px 24px',
    }}
  >
    Перейти в каталог
  </button>
</div>
      )}

      {retailCart.length > 0 && (
  <div>

    <div style={{
      ...adminCard,
      marginBottom: 16,
      fontSize: 13,
      lineHeight: 1.7,
      color: '#d8c9e7',
    }}>
      {deliveryType === 'pickup' ? (
        <>
          <strong>Самовывоз по договорённости</strong>
          <div style={{ marginTop: 6 }}>
            Уточните доступный город и место получения у менеджера.
          </div>
        </>
      ) : (
        <>
          <strong>Доставка GLS · Германия</strong>
          <div style={{ marginTop: 6 }}>
            {retailCart.reduce((sum, item) => sum + item.quantity, 0) <= 10
              ? 'Стоимость доставки — от 5,89 €'
              : 'Стоимость рассчитывается индивидуально в зависимости от посылки'}
          </div>
        </>
      )}
    </div>
  </div>
)}
      
      {retailCart.length > 0 && (() => {
  const getProductQty = (productId: number) =>
    retailCart
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0)

  const getUnitPrice = (productId: number) => {
    const product = retailProducts.find(
      p => Number(p.id) === productId
    )

    const qty = getProductQty(productId)

    const tiers = [...(product?.retail_tiers || [])]
      .sort((a: any, b: any) =>
        Number(a.min_qty) - Number(b.min_qty)
      )

    const activeTier = tiers
      .filter((tier: any) =>
        qty >= Number(tier.min_qty)
      )
      .pop()

    return activeTier
      ? Number(activeTier.price)
      : null
  }

  const retailCount = retailCart.reduce(
    (sum, item) => sum + item.quantity, 0
  )

  const retailTotal = retailCart.reduce(
    (sum, item) => {
      const price = getUnitPrice(item.productId)
      return sum + (price ?? 0) * item.quantity
    },
    0
  )

  const hasMissingPrices = retailCart.some(
    item => getUnitPrice(item.productId) === null
  )

  return (
    <div style={{ ...adminCard, marginBottom: 18 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <div>
          <div style={{
            fontSize: 21,
            fontWeight: 800,
          }}>
            Розница
          </div>
          <div style={{
            fontSize: 12,
            color: '#999',
            marginTop: 5,
          }}>
            {retailCount} шт. в корзине
          </div>
        </div>

        <span style={adminBadge(true)}>
          От 1 шт.
        </span>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {retailCart.map(item => {
          const product = retailProducts.find(
            p => Number(p.id) === item.productId
          )

          const unitPrice = getUnitPrice(item.productId)
          const subtotal = (unitPrice ?? 0) * item.quantity
          const stock = Number(item.stock) || 0

          return (
            <div
              key={`${item.productId}-${item.flavorId}`}
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 15,
                padding: 12,
              }}
            >
              <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 14,
              }}>
                <div style={{
                  width: 68,
                  height: 68,
                  flexShrink: 0,
                  borderRadius: 12,
                  background: '#292035',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {product?.photo_url ? (
                    <img
                      src={photoUrl(product.photo_url) || ''}
                      alt={item.productName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 26 }}>📦</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 14,
                    overflowWrap: 'anywhere',
                  }}>
                    {item.productName}
                  </div>

                  <div style={{
                    color: '#aaa',
                    fontSize: 12,
                    marginTop: 6,
                  }}>
                    {item.flavorName}
                  </div>

                  <div style={{
                    color: '#c084fc',
                    fontSize: 12,
                    marginTop: 7,
                  }}>
                    {unitPrice !== null
                      ? `${unitPrice.toFixed(2)} € / шт.`
                      : 'Цена не задана'}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Удалить вкус"
                  onClick={() => {
                    setRetailCart(prev =>
                      prev.filter(row =>
                        !(
                          row.productId === item.productId &&
                          row.flavorId === item.flavorId
                        )
                      )
                    )
                    showToast('Товар удалён')
                  }}
                  style={{
                    alignSelf: 'flex-start',
                    border: 'none',
                    background: 'rgba(255,90,90,0.10)',
                    color: '#ff8585',
                    borderRadius: 10,
                    padding: '8px 11px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid rgba(168,85,247,0.4)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#29183c',
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRetailCart(prev =>
                        prev
                          .map(row =>
                            row.productId === item.productId &&
                            row.flavorId === item.flavorId
                              ? {
                                  ...row,
                                  quantity: row.quantity - 1,
                                }
                              : row
                          )
                          .filter(row => row.quantity > 0)
                      )
                    }}
                    style={{
                      width: 42,
                      height: 42,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: 22,
                      cursor: 'pointer',
                    }}
                  >
                    −
                  </button>

                  <span style={{
                    minWidth: 32,
                    textAlign: 'center',
                    fontWeight: 800,
                  }}>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    disabled={item.quantity >= stock}
                    onClick={() => {
                      setRetailCart(prev =>
                        prev.map(row =>
                          row.productId === item.productId &&
                          row.flavorId === item.flavorId
                            ? {
                                ...row,
                                quantity: Math.min(
                                  row.stock,
                                  row.quantity + 1
                                ),
                              }
                            : row
                        )
                      )
                    }}
                    style={{
                      width: 42,
                      height: 42,
                      background: 'rgba(168,85,247,0.18)',
                      border: 'none',
                      color: '#fff',
                      fontSize: 22,
                      cursor: item.quantity >= stock
                        ? 'not-allowed'
                        : 'pointer',
                      opacity: item.quantity >= stock ? 0.4 : 1,
                    }}
                  >
                    +
                  </button>
                </div>

                <strong style={{
                  color: '#fff',
                  fontSize: 16,
                  whiteSpace: 'nowrap',
                }}>
                  {unitPrice !== null
                    ? `${subtotal.toFixed(2)} €`
                    : '—'}
                </strong>
              </div>

              <div style={{
                color: '#888',
                fontSize: 11,
                marginTop: 10,
              }}>
                В наличии: {stock} шт.
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        marginTop: 20,
        paddingTop: 18,
        borderTop: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
          fontSize: 13,
          color: '#aaa',
        }}>
          <span>Количество товаров</span>
          <strong style={{ color: '#fff' }}>
            {retailCount} шт.
          </strong>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <strong style={{ fontSize: 16 }}>
            Итого
          </strong>

          <strong style={{
            fontSize: 24,
            color: '#c084fc',
          }}>
            {hasMissingPrices
              ? 'Цена не задана'
              : `${retailTotal.toFixed(2)} €`}
          </strong>
        </div>
      </div>

      <button
  type="button"
  disabled={hasMissingPrices}
  onClick={() => setScreen('retail_checkout')}
  style={{
    ...adminPrimaryBtn,
    width: '100%',
    marginTop: 20,
    padding: 16,
    fontSize: 15,
    opacity: hasMissingPrices ? 0.5 : 1,
    cursor: hasMissingPrices ? 'not-allowed' : 'pointer',
  }}
>
  Оформить розничный заказ
</button>

      <div style={{
        marginTop: 12,
        color: '#888',
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 1.6,
      }}>
        Следующий этап — новое оформление розничного заказа.
        Пока заказ не создаётся и оплата не производится.
      </div>
    </div>
  )
})()}
      {cart.length > 0 && (
        <div style={{ ...card, marginBottom: 18 }}>
          <h2>🛍 Розница</h2>

          {cart.map(item => (
            <div
              key={item.product.id}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #333',
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {item.product.name}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 8,
              }}>
                <button onClick={() =>
                  changeRetailQty(item.product.id, -1)
                }>−</button>

                <span>{item.quantity}</span>

                <button onClick={() =>
                  changeRetailQty(item.product.id, 1)
                }>+</button>

                <span style={{ marginLeft: 'auto' }}>
                  {(item.product.price * item.quantity).toFixed(2)} €
                </span>
              </div>
            </div>
          ))}

          <h3>Итого: {retailTotal.toFixed(2)} €</h3>

          <button
            style={btnMain}
            onClick={() => setScreen('checkout')}
          >
            Оформить розничный заказ
          </button>
        </div>
      )}

      {wholesaleCart.length > 0 && (
        <div style={{ ...card, marginBottom: 18 }}>
          <h2>📦 Опт</h2>

          {wholesaleRows.map(item => (
            <div
              key={`${item.productId}-${item.flavorId}`}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #333',
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {item.productName}
              </div>

              <div style={{ color: '#aaa', fontSize: 13 }}>
                {item.flavorName}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 10,
              }}>
                <button onClick={() =>
                  changeWholesaleQty(item.flavorId, -1)
                }>−</button>

                <span>{item.quantity}</span>

                <button onClick={() =>
                  changeWholesaleQty(item.flavorId, 1)
                }>+</button>

                <span style={{ marginLeft: 'auto' }}>
                  {item.hasPrice
                    ? `${item.subtotal.toFixed(2)} €`
                    : 'Цена не задана'}
                </span>
              </div>

              <div style={{
                color: '#aaa',
                fontSize: 12,
                marginTop: 6,
              }}>
                {item.hasPrice
                  ? `${item.unitPrice.toFixed(2)} €/шт.`
                  : 'Нет оптового прайса'}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 18 }}>
            <div>Всего: {wholesaleCount} шт.</div>

            <h2>
              Итого: {wholesaleTotal.toFixed(2)} €
            </h2>

            {wholesaleCount < 20 && (
              <p style={{ color: '#fbbf24' }}>
                Для оформления нужно ещё {20 - wholesaleCount} шт.
              </p>
            )}

            <button
  type="button"
  disabled={wholesaleCount < 20 || wholesaleRows.some(item => !item.hasPrice)}
  onClick={() => setScreen('wholesale_checkout')}
  style={{
    ...adminPrimaryBtn,
    width: '100%',
    padding: 15,
    marginTop: 12,
    opacity: wholesaleCount < 20 ? 0.5 : 1,
    cursor: wholesaleCount < 20 ? 'not-allowed' : 'pointer',
  }}
>
  Оформить оптовый заказ
</button>

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
  
  return (
    <div key={screen} style={{ ...page, position: 'relative' }}>
      <RetailTopBar wholesale={priceMode === 'wholesale'} />
<div style={{ fontSize: 13, color: '#8a8a8a', marginBottom: 16, letterSpacing: '0.04em' }}>Каталог</div>
      <div style={{
  display: 'flex',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 14,
  padding: 4,
  marginBottom: 16,
  gap: 4,
}}>
  <button
    onClick={() => setPriceMode('retail')}
    style={{
      flex: 1,
      padding: '10px 16px',
      borderRadius: 10,
      border: 0,
      background: priceMode === 'retail' 
        ? 'linear-gradient(90deg, #7c3aed, #a855f7)' 
        : 'transparent',
      color: '#fff',
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer',
    }}
  >
    Розница
  </button>
  <button
    onClick={() => setPriceMode('wholesale')}
    style={{
      flex: 1,
      padding: '10px 16px',
      borderRadius: 10,
      border: 0,
      background: priceMode === 'wholesale' 
        ? 'linear-gradient(90deg, #7c3aed, #a855f7)' 
        : 'transparent',
      color: '#fff',
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer',
    }}
  >
    Опт
  </button>
</div>
      {loading ? <div style={{ color: '#a0a0a0', marginBottom: 12 }}>Загрузка...</div> : null}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {priceMode === 'wholesale' ? (
  <>
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setScreen('conditions')}
        style={{
          ...card,
          padding: '14px 16px',
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Условия работы
      </button>

      <div style={{ ...card, padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>💬 Нашли дешевле? Сделаем лучше!</div>
        <div style={{ fontSize: 13, color: '#c8c8c8', lineHeight: 1.45 }}>
          Напишите менеджеру — <a href="https://t.me/optpuffy" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>@optpuffy</a>, предложим более выгодную цену на опт!
        </div>
      </div>
    </div>

    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 4 }}>
      {[
  { id: 'all', name: 'Все', img: '' },
  { id: '1', name: 'Жижи', img: '/жижи.png' },
  { id: '2', name: 'Одноразки', img: '/одноразки.png' },
  { id: '3', name: 'Поды', img: '/поды.png' },
  { id: '4', name: 'Картриджи', img: '/картриджи.png' },
  { id: '5', name: 'Снюс', img: '/снюс.png' },
].map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => setOptCat(cat.id)}
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: cat.img ? `url(${cat.img}) center/cover` : 'rgba(255,255,255,0.08)',
            border: optCat === cat.id ? '2px solid #fff' : '2px solid transparent',
          }} />
          <div style={{ fontSize: 11, fontWeight: 600 }}>{cat.name}</div>
        </button>
      ))}
    </div>
    <div style={{
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  marginTop: 12,
}}>
  {wholesaleProducts
    .filter(p =>
      (optCat === 'all' || String(p.category_id) === optCat) &&
      Number(p.is_visible ?? 1) !== 0
    )
    .map(p => {
      const img = photoUrl(p.photo_url)

      const sortedPrices = [...(p.wholesale_tiers || [])]
        .sort((a: any, b: any) =>
          Number(a.min_qty) - Number(b.min_qty)
        )

      return (
        <div
          key={p.id}
          onClick={() => {
            setSelectedWholesaleId(Number(p.id))
            setScreen('wholesale_product')
          }}
          style={{
            background: '#1c1724',
            border: '1px solid rgba(168,85,247,0.28)',
            borderRadius: 16,
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <div style={{
            width: '100%',
            aspectRatio: '1 / 1',
            background: '#292035',
          }}>
            {img ? (
              <img
                src={img}
                alt={p.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
                fontSize: 13,
              }}>
                Нет фотографии
              </div>
            )}
          </div>

          <div style={{
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 10,
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.4,
              overflowWrap: 'anywhere',
            }}>
              {p.name}
            </div>

            <div style={{
              fontSize: 12,
              color: Number(p.stock) > 0 ? '#4ade80' : '#aaa',
            }}>
              В наличии: {p.stock || 0} шт.
            </div>

            <div style={{
              marginTop: 'auto',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              paddingTop: 10,
            }}>
              <div style={{
                fontSize: 11,
                color: '#b8a7c8',
                marginBottom: 8,
              }}>
                Оптовые цены
              </div>

              {sortedPrices.length > 0 ? (
                sortedPrices.map((t: any) => (
                  <div
                    key={t.id ?? t.min_qty}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 6,
                      fontSize: 11,
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span>От {t.min_qty} шт.</span>
                    <strong>
                      {Number(t.price).toFixed(2)} €
                    </strong>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 12, color: '#aaa' }}>
                  Цены уточняются
                </div>
              )}
            </div>

            <div style={{
              background: 'linear-gradient(90deg, #7c3aed, #b21bd0)',
              borderRadius: 10,
              padding: '12px 6px',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
            }}>
              Выбрать вкусы
            </div>
          </div>
        </div>
      )
    })}

  {wholesaleProducts.filter(p =>
    (optCat === 'all' || String(p.category_id) === optCat) &&
    Number(p.is_visible ?? 1) !== 0
  ).length === 0 && (
    <div style={{
      gridColumn: '1 / -1',
      color: '#888',
      textAlign: 'center',
      padding: 16,
    }}>
      Товаров в этой категории пока нет
    </div>
  )}
</div>
  </>
) : (
  <>
  {retailProducts
    .filter(p => Number(p.is_visible ?? 1) !== 0)
    .map(p => {
      const img = photoUrl(p.photo_url)

      return (
        <div
          key={p.id}
          onClick={() => {
  setSelectedRetailId(Number(p.id))
  setScreen('retail_product')
}}
          style={{
            background: '#1c1724',
            border: '1px solid rgba(168,85,247,0.28)',
            borderRadius: 16,
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <div style={{
            width: '100%',
            aspectRatio: '1 / 1',
            background: '#292035',
          }}>
            {img ? (
              <img
                src={img}
                alt={p.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
                fontSize: 12,
              }}>
                Нет фотографии
              </div>
            )}
          </div>

          <div style={{
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 10,
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              overflowWrap: 'anywhere',
            }}>
              {p.name}
            </div>

            <div style={{
              fontSize: 12,
              color: '#34d399',
            }}>
              В наличии: {p.stock || 0} шт.
            </div>

            <div style={{
              marginTop: 'auto',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              paddingTop: 10,
              color: '#b8a7c8',
              fontSize: 12,
            }}>
              {(p.retail_tiers || []).length > 0 ? (
  <div style={{ display: 'grid', gap: 8 }}>
    {(p.retail_tiers || []).map((tier: any) => (
      <div
        key={tier.id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          alignItems: 'center',
          fontSize: 12,
        }}
      >
        <span>От {tier.min_qty} шт.</span>
        <strong style={{ color: '#fff' }}>
          {Number(tier.price).toFixed(2)} €
        </strong>
      </div>
    ))}
  </div>
) : (
  <span>Цены уточняются</span>
)}
            </div>

            <div style={{
              background: 'linear-gradient(90deg, #7c3aed, #b21bd0)',
              borderRadius: 10,
              padding: 12,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
            }}>
              Выбрать вкусы
            </div>
          </div>
        </div>
      )
    })}

  {retailProducts.filter(
    p => Number(p.is_visible ?? 1) !== 0
  ).length === 0 && (
    <div style={{
      gridColumn: '1 / -1',
      color: '#888',
      textAlign: 'center',
      padding: 20,
    }}>
      В рознице пока нет товаров
    </div>
  )}
</>
)}
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
