import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { UILanguage } from './i18n'

type Props = {
  name: string
  username?: string | null
  photo?: string | null
  clientNo?: number | null
  ordersTotal?: number | null
  referralsTotal?: number | null
  statsLoading: boolean
  hasDiscount: boolean
  referralLink: string | null
  language: UILanguage
  onLanguageChange: (next: UILanguage) => void
  onDiscountInfo: () => void
  onCopyReferral: () => void
  onShareReferral: () => void
  ui: (value: string) => string
}

const panel: CSSProperties = {
  background: '#1D1726',
  border: '1px solid #392B46',
  borderRadius: 20,
}

function ProfileIcon({ kind, size = 20 }: { kind: 'gift' | 'copy' | 'share' | 'language' | 'chevron' | 'info' | 'users' | 'bag'; size?: number }) {
  const paths = {
    gift: <><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8H8a2.5 2.5 0 1 1 2.5-2.5L12 8Zm0 0h4a2.5 2.5 0 1 0-2.5-2.5L12 8Z"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    share: <><path d="M12 16V3m0 0 4 4m-4-4L8 7"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></>,
    language: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18m0-18c5 5 5 13 0 18"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    bag: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>
}

export default function ProfileOverview({
  name, username, photo, clientNo, ordersTotal, referralsTotal, statsLoading,
  hasDiscount, referralLink, language, onLanguageChange, onDiscountInfo,
  onCopyReferral, onShareReferral, ui,
}: Props) {
  const [languageOpen, setLanguageOpen] = useState(false)

  return (
    <>
      <div style={{
        margin: '-20px -16px 18px', padding: '30px 20px 22px',
        background: 'linear-gradient(145deg, #251638 0%, #321B55 54%, #181321 100%)',
        borderBottom: '1px solid #5C3B79', borderRadius: '0 0 26px 26px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -72, right: -60, width: 185, height: 185, borderRadius: '50%', background: 'rgba(168,85,247,0.11)', pointerEvents: 'none' }}/>
        <div style={{ color: '#C3A8E2', fontSize: 11, fontWeight: 750, letterSpacing: '0.16em', marginBottom: 21 }}>
          PUFFY STORE / {ui('Профиль').toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ width: 68, height: 68, borderRadius: 20, flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(207,163,255,0.5)', background: '#20142d', boxShadow: '0 5px 22px #100A1A70', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0DAFF', fontWeight: 800, fontSize: 30 }}>
            {photo ? <img alt="" src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : name.slice(0,1).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 21, fontWeight: 800, overflowWrap: 'anywhere' }}>{name}</div>
            {username && <div style={{ marginTop: 3, color: '#C6ADDD', fontSize: 13 }}>@{username}</div>}
            {clientNo != null && <div style={{ marginTop: 7, display: 'inline-flex', padding: '5px 9px', fontSize: 11, fontWeight: 700, color: '#E7D4FF', border: '1px solid #714D97', borderRadius: 9, background: '#6E42A333' }}>ID M-{String(clientNo).padStart(3,'0')}</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 13 }}>
        {([
          { label: ui('Заказов'), value: ordersTotal, kind: 'bag' as const },
          { label: ui('Друзей'), value: referralsTotal, kind: 'users' as const },
        ]).map(item => (
          <div key={item.kind} style={{ ...panel, padding: '16px 15px 17px', background: 'linear-gradient(160deg,#261B33,#1B1622)' }}>
            <div style={{ color: '#B88AF2', marginBottom: 14 }}><ProfileIcon kind={item.kind} size={21}/></div>
            <div style={{ fontSize: 29, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
              {statsLoading ? '…' : item.value == null ? '—' : item.value}
            </div>
            <div style={{ color: '#ADA1B9', fontSize: 12, fontWeight: 600, marginTop: 8 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...panel, padding: '15px 16px', marginBottom: 13, display: 'flex', alignItems: 'center', gap: 13 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, height: 42, width: 42, flexShrink: 0, color: '#D5B5FF', background: '#6B3BAE40' }}><ProfileIcon kind="gift" size={23}/></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#FFFFFF', fontWeight: 750, fontSize: 14 }}>{ui('Реферальная скидка')}</div>
          <div style={{ color: hasDiscount ? '#D7B6FF' : '#A99BB9', fontSize: 12, marginTop: 3 }}>{hasDiscount ? ui('Доступна скидка 5 €') : ui('Пригласите 2 друзей с заказами')}</div>
        </div>
        <button type="button" onClick={onDiscountInfo} aria-label={ui('Как работает скидка')}
          style={{ background: '#342640', color: '#CBB1E9', border: '1px solid #534064', borderRadius: 11, padding: 9, display: 'flex', cursor: 'pointer' }}>
          <ProfileIcon kind="info" size={18}/>
        </button>
      </div>

      <div style={{ ...panel, padding: 17, marginBottom: 13 }}>
        <div style={{ fontSize: 15, color: '#FFF', fontWeight: 750, marginBottom: 6 }}>{ui('Пригласить друзей')}</div>
        <div style={{ fontSize: 12, color: '#AA9AB9', lineHeight: 1.55, marginBottom: 13 }}>{ui('Поделитесь персональной ссылкой')}</div>
        <div style={{ background: '#121018', color: '#CBBCE0', border: '1px solid #3B2B48', borderRadius: 12, padding: '12px 13px', fontSize: 12, overflowWrap: 'anywhere', marginBottom: 12 }}>
          {referralLink || ui('Откройте магазин через Telegram')}
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button disabled={!referralLink} type="button" onClick={onCopyReferral}
            style={{ flex: 1, padding: '12px 9px', border: 'none', borderRadius: 12, color: '#FFFFFF', fontWeight: 700, fontSize: 13, background: '#7C3AED', cursor: referralLink ? 'pointer' : 'not-allowed', opacity: referralLink ? 1 : 0.5, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <ProfileIcon kind="copy" size={17}/> {ui('Скопировать')}
          </button>
          <button disabled={!referralLink} type="button" onClick={onShareReferral}
            style={{ flex: 1, padding: '12px 9px', border: '1px solid #614478', borderRadius: 12, color: '#E7D9F2', fontWeight: 700, fontSize: 13, background: '#30213F', cursor: referralLink ? 'pointer' : 'not-allowed', opacity: referralLink ? 1 : 0.5, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <ProfileIcon kind="share" size={17}/> {ui('Поделиться')}
          </button>
        </div>
      </div>

      <div style={{ ...panel, padding: 16, marginBottom: 12 }}>
        <button type="button" onClick={() => setLanguageOpen(open => !open)} aria-expanded={languageOpen}
          style={{ width: '100%', border: 0, background: 'none', padding: 0, color: '#FFFFFF', display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ display: 'flex', color: '#CBB0ED' }}><ProfileIcon kind="language" size={21}/></span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{ui('Язык')}</span>
          <span style={{ fontSize: 12, color: '#C7AAE8', fontWeight: 750 }}>{language.toUpperCase()}</span>
          <span style={{ color: '#B9A3CF', transform: languageOpen ? 'rotate(90deg)' : 'none' }}><ProfileIcon kind="chevron" size={17}/></span>
        </button>
        {languageOpen && <div style={{ display: 'flex', gap: 9, marginTop: 15 }}>
          {(['ru','en'] as const).map(option => (
            <button key={option} type="button" onClick={() => { onLanguageChange(option); setLanguageOpen(false) }}
              style={{ flex: 1, padding: 12, borderRadius: 11, color: '#FFFFFF', cursor: 'pointer', fontWeight: 650, background: language === option ? '#7135A8' : '#30233D', border: language === option ? '1px solid #B68EE7' : '1px solid #4D3D5C' }}>
              {option === 'ru' ? 'Русский' : 'English'}
            </button>
          ))}
        </div>}
      </div>
    </>
  )
}
