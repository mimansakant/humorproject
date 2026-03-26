'use client'

import { useEffect, useState } from 'react'

const BULB_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4']
const BULB_COUNT = 30

export default function BottomFairyLights() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20"
      style={{
        backgroundColor: '#111118',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="relative w-full" style={{ height: '58px' }}>
        {/* Wire */}
        <div
          className="absolute left-0 right-0"
          style={{ top: '18px', height: '1px', backgroundColor: '#4b4b55' }}
        />
        {/* Bulbs */}
        {Array.from({ length: BULB_COUNT }, (_, i) => {
          const color = BULB_COLORS[i % BULB_COLORS.length]
          const left = `${(i / (BULB_COUNT - 1)) * 100}%`
          const duration = `${1.4 + (i % 7) * 0.35}s`
          const delay = `${(i * 0.27) % 2.4}s`
          return (
            <div
              key={i}
              className="absolute"
              style={{ left, top: '15px', transform: 'translateX(-50%)' }}
            >
              <div
                style={{
                  width: '6px',
                  height: '4px',
                  backgroundColor: '#4b4b55',
                  margin: '0 auto',
                  borderRadius: '2px 2px 0 0',
                }}
              />
              <div
                style={{
                  width: '10px',
                  height: '14px',
                  backgroundColor: color,
                  borderRadius: '50% 50% 60% 60%',
                  boxShadow: `0 0 7px 3px ${color}bb`,
                  animation: `twinkle ${duration} ease-in-out infinite`,
                  animationDelay: delay,
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
