import { useEffect, useRef, useState } from 'react'

const API_URL = 'https://web-production-8afa.up.railway.app'

type Banner = {
  id: number
  image_url: string
  link_url: string
  is_active: number
  sort_order: number
}

function photoSource(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

function openBannerLink(link: string) {
  const url = link.trim()
  if (!/^https?:\/\//i.test(url)) return
  const tg = (window as Window & {
    Telegram?: { WebApp?: { openLink?: (value: string) => void; openTelegramLink?: (value: string) => void } }
  }).Telegram?.WebApp
  try {
    const parsed = new URL(url)
    const isTelegram = ['t.me', 'telegram.me', 'telegram.dog'].includes(parsed.hostname.toLowerCase())
    if (isTelegram && tg?.openTelegramLink) {
      tg.openTelegramLink(url)
    } else if (tg?.openLink) {
      tg.openLink(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  } catch {
    // Invalid links do nothing.
  }
}

export default function CatalogBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [active, setActive] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_URL}/api/banners`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить баннеры')
        return response.json()
      })
      .then(data => {
        const list = Array.isArray(data.banners) ? data.banners : []
        setBanners(list.filter((b: Banner) => b && Number(b.is_active) !== 0))
      })
      .catch(error => {
        if (error?.name !== 'AbortError') console.error('Ошибка баннеров:', error)
      })
    return () => controller.abort()
  }, [])

  function moveTo(index: number) {
    const parent = scrollerRef.current
    if (!parent) return
    parent.scrollTo({ left: parent.clientWidth * index, behavior: 'smooth' })
    setActive(index)
  }

  useEffect(() => {
    if (banners.length < 2) return
    const interval = window.setInterval(() => {
      const next = (Math.round((scrollerRef.current?.scrollLeft || 0) / (scrollerRef.current?.clientWidth || 1)) + 1) % banners.length
      moveTo(next)
    }, 5500)
    return () => window.clearInterval(interval)
  }, [banners.length])

  if (banners.length === 0) return null

  return (
    <section aria-label="Баннеры магазина" style={{ marginBottom: 20, width: '100%', minWidth: 0 }}>
      <div
        ref={scrollerRef}
        onScroll={event => {
          const el = event.currentTarget
          if (el.clientWidth > 0) setActive(Math.min(banners.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))))
        }}
        style={{
          display: 'flex',
          width: '100%',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          borderRadius: 18,
        }}
      >
        {banners.map(banner => {
          const link = (banner.link_url || '').trim()
          const image = (
            <img
              src={photoSource(banner.image_url)}
              alt="Баннер Puffy Store"
              loading="lazy"
              draggable={false}
              style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
            />
          )
          const sharedStyle = {
            flex: '0 0 100%',
            minWidth: 0,
            scrollSnapAlign: 'start' as const,
            overflow: 'hidden' as const,
            borderRadius: 18,
            background: '#24192F',
            border: '1px solid #463451',
            padding: 0,
          }
          return link ? (
            <button key={banner.id} type="button" onClick={() => openBannerLink(link)} aria-label="Открыть ссылку баннера" style={{ ...sharedStyle, cursor: 'pointer' }}>
              {image}
            </button>
          ) : (
            <div key={banner.id} style={sharedStyle}>{image}</div>
          )
        })}
      </div>
      {banners.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 10 }}>
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Показать баннер ${index + 1}`}
              onClick={() => moveTo(index)}
              style={{
                width: active === index ? 20 : 7,
                height: 7,
                padding: 0,
                border: 0,
                borderRadius: 999,
                background: active === index ? '#A855F7' : '#62516D',
                transition: 'width 0.2s, background 0.2s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
