import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

const API_URL = 'https://web-production-8afa.up.railway.app'

type Banner = {
  id: number
  image_url: string
  link_url: string
  is_active: number
  sort_order: number
}

type BannerUpdate = {
  link_url?: string
  is_active?: boolean
  sort_order?: number
}

type Props = {
  onBack: () => void
}

const purple = '#7737C2'
const surface = '#1D1725'
const muted = '#B5A7C2'
const border = '1px solid #463451'

const mainButton: CSSProperties = {
  background: purple,
  color: '#FFFFFF',
  border: 'none',
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 700,
  borderRadius: 12,
  cursor: 'pointer',
}
const secondaryButton: CSSProperties = {
  background: '#2A2034',
  color: '#F7F3FB',
  border,
  padding: '10px 12px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 11,
  cursor: 'pointer',
}
const field: CSSProperties = {
  display: 'block',
  width: '100%',
  minWidth: 0,
  padding: '12px 14px',
  background: '#271E30',
  border,
  borderRadius: 12,
  color: '#FFFFFF',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

function imageSrc(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

function validateLink(value: string): string {
  const link = value.trim()
  if (!link) return ''
  let parsed: URL
  try {
    parsed = new URL(link)
  } catch {
    throw new Error('Ссылка должна начинаться с https:// или http://')
  }
  if (!['https:', 'http:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error('Допустимы только ссылки https:// или http://')
  }
  return link
}

function PhotoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  )
}

export default function AdminBanners({ onBack }: Props) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [draftLinks, setDraftLinks] = useState<Record<number, string>>({})
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [newLink, setNewLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function api(path: string, options: RequestInit = {}) {
    const initData = (window as any).Telegram?.WebApp?.initData || ''
    if (!initData) throw new Error('Откройте админку через Telegram-бота')
    const headers = new Headers(options.headers)
    headers.set('X-Telegram-Init-Data', initData)
    const response = await fetch(`${API_URL}${path}`, { ...options, headers })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(typeof result.detail === 'string' ? result.detail : `Ошибка сервера: ${response.status}`)
    }
    return result
  }

  async function reload() {
    const data = await api('/api/admin/banners')
    const list: Banner[] = Array.isArray(data.banners) ? data.banners : []
    setBanners(list)
    setDraftLinks(Object.fromEntries(list.map(b => [b.id, b.link_url || ''])))
  }

  useEffect(() => {
    void reload()
      .catch(e => setError(e instanceof Error ? e.message : 'Не удалось загрузить баннеры'))
      .finally(() => setLoading(false))
  }, [])

  async function run(action: () => Promise<void>, doneMessage: string) {
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
      await reload()
      setNotice(doneMessage)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить действие')
    } finally {
      setBusy(false)
    }
  }

  async function patchBanner(id: number, data: BannerUpdate) {
    await api(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  function addBanner() {
    if (!newPhoto) {
      setError('Сначала выбери фотографию')
      return
    }
    void run(async () => {
      const photo = newPhoto
      if (photo.size > 5 * 1024 * 1024) throw new Error('Фотография не должна превышать 5 МБ')
      const form = new FormData()
      form.append('file', photo)
      form.append('link_url', validateLink(newLink))
      await api('/api/admin/banners', { method: 'POST', body: form })
      setNewPhoto(null)
      setNewLink('')
    }, 'Баннер добавлен')
  }

  function changePhoto(id: number, photo: File | undefined) {
    if (!photo) return
    void run(async () => {
      if (photo.size > 5 * 1024 * 1024) throw new Error('Фотография не должна превышать 5 МБ')
      const form = new FormData()
      form.append('file', photo)
      await api(`/api/admin/banners/${id}/photo`, { method: 'POST', body: form })
    }, 'Фотография обновлена')
  }

  function updateLink(banner: Banner) {
    void run(async () => {
      await patchBanner(banner.id, { link_url: validateLink(draftLinks[banner.id] || '') })
    }, 'Ссылка сохранена')
  }

  function toggleBanner(banner: Banner) {
    void run(async () => {
      await patchBanner(banner.id, { is_active: !Boolean(banner.is_active) })
    }, banner.is_active ? 'Баннер скрыт' : 'Баннер опубликован')
  }

  function moveBanner(index: number, offset: number) {
    const target = index + offset
    if (target < 0 || target >= banners.length) return
    void run(async () => {
      const ordered = [...banners]
      const first = ordered[index]
      const second = ordered[target]
      if (!first || !second) return
      ordered[index] = second
      ordered[target] = first
      await Promise.all(ordered.map((banner, i) => patchBanner(banner.id, { sort_order: i })))
    }, 'Порядок сохранён')
  }

  function removeBanner(banner: Banner) {
    if (!window.confirm('Удалить этот баннер?')) return
    void run(async () => {
      await api(`/api/admin/banners/${banner.id}`, { method: 'DELETE' })
    }, 'Баннер удалён')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      padding: '20px 16px 110px',
      background: '#111014',
      color: '#FFFFFF',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      boxSizing: 'border-box',
    }}>
      <button type="button" onClick={onBack} style={{ ...secondaryButton, marginBottom: 20 }}>
        Назад в админку
      </button>
      <h2 style={{ margin: '0 0 8px', fontSize: 25, fontWeight: 800 }}>Баннеры</h2>
      <p style={{ color: muted, fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>
        Управление баннерами в каталоге. Ссылка необязательна: без неё нажатие на баннер ничего не делает.
      </p>

      {error && (
        <div role="alert" style={{ color: '#FFC4C4', background: '#3F1C2A', padding: 12, borderRadius: 12, marginBottom: 12 }}>
          {error}
        </div>
      )}
      {notice && (
        <div role="status" style={{ color: '#BAF4D4', background: '#1A392B', padding: 12, borderRadius: 12, marginBottom: 12 }}>
          {notice}
        </div>
      )}

      <section style={{ background: surface, border, borderRadius: 20, padding: 16, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>Добавить баннер</h3>
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '22px 12px', border: '1px dashed #8058AA', borderRadius: 14,
          background: '#241A2F', color: '#D8C4EB', cursor: 'pointer',
          textAlign: 'center', marginBottom: 15, fontSize: 13, overflowWrap: 'anywhere',
        }}>
          <PhotoIcon />
          <span>{newPhoto ? newPhoto.name : 'Выбрать фотографию · JPG, PNG, WEBP · до 5 МБ'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={e => setNewPhoto(e.target.files?.[0] || null)} />
        </label>
        <label style={{ display: 'block', color: muted, fontSize: 13, marginBottom: 8 }}>
          Ссылка (необязательно)
        </label>
        <input type="url" placeholder="https://example.com" value={newLink}
          onChange={e => setNewLink(e.target.value)} style={{ ...field, marginBottom: 16 }} />
        <button type="button" disabled={busy} onClick={addBanner}
          style={{ ...mainButton, width: '100%', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Сохранение...' : 'Сохранить баннер'}
        </button>
      </section>

      <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>Сохранённые баннеры · {banners.length}</h3>
      {loading ? (
        <p style={{ color: muted }}>Загрузка...</p>
      ) : banners.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', border, borderRadius: 16, color: muted }}>
          Баннеров пока нет
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {banners.map((banner, index) => (
            <section key={banner.id} style={{ background: surface, border, borderRadius: 18, padding: 14 }}>
              <img src={imageSrc(banner.image_url)} alt={`Баннер ${index + 1}`}
                style={{ display: 'block', width: '100%', aspectRatio: '16 / 7', objectFit: 'cover', borderRadius: 12, background: '#120F17', marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Баннер {index + 1}</span>
                <span style={{ fontSize: 12, color: banner.is_active ? '#86E9BA' : muted }}>
                  {banner.is_active ? 'Опубликован' : 'Скрыт'}
                </span>
              </div>
              <label style={{ display: 'block', color: muted, fontSize: 12, marginBottom: 7 }}>
                Ссылка · пустое поле отключает переход
              </label>
              <input type="url" value={draftLinks[banner.id] ?? banner.link_url ?? ''}
                onChange={e => setDraftLinks(previous => ({ ...previous, [banner.id]: e.target.value }))}
                placeholder="https://example.com" style={{ ...field, marginBottom: 9 }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <button type="button" disabled={busy} onClick={() => updateLink(banner)} style={secondaryButton}>
                  Сохранить ссылку
                </button>
                <label style={{ ...secondaryButton, display: 'inline-flex', alignItems: 'center' }}>
                  Заменить фото
                  <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                    onChange={e => { changePhoto(banner.id, e.target.files?.[0]); e.target.value = '' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" disabled={busy} onClick={() => toggleBanner(banner)} style={secondaryButton}>
                  {banner.is_active ? 'Скрыть' : 'Показать'}
                </button>
                <button type="button" disabled={busy || index === 0} onClick={() => moveBanner(index, -1)} style={secondaryButton}>
                  Выше
                </button>
                <button type="button" disabled={busy || index === banners.length - 1} onClick={() => moveBanner(index, 1)} style={secondaryButton}>
                  Ниже
                </button>
                <button type="button" disabled={busy} onClick={() => removeBanner(banner)}
                  style={{ ...secondaryButton, color: '#FFC4C4', marginLeft: 'auto' }}>
                  Удалить
                </button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
