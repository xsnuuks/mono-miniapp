import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function Root() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.muted = true
    v.defaultMuted = true
    v.playsInline = true

    const tryPlay = () => {
      v.muted = true
      const p = v.play()
      if (p && typeof p.then === 'function') {
        p.catch(() => {})
      }
    }

    tryPlay()
    v.addEventListener('canplay', tryPlay)
    v.addEventListener('loadeddata', tryPlay)

    const onTouch = () => tryPlay()
    document.addEventListener('touchstart', onTouch, { passive: true })
    document.addEventListener('click', onTouch)

    const tg = (window as any).Telegram?.WebApp
    if (tg?.ready) {
      tg.ready()
      tryPlay()
    }

    const id = window.setInterval(tryPlay, 1500)

    return () => {
      v.removeEventListener('canplay', tryPlay)
      v.removeEventListener('loadeddata', tryPlay)
      document.removeEventListener('touchstart', onTouch)
      document.removeEventListener('click', onTouch)
      window.clearInterval(id)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#000' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <App />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)