'use client'

import { useState } from 'react'

const TINTS = ['#7c3aed', '#0e7490', '#065f46', '#9d174d', '#92400e', '#1e3a5f']
const ROTATIONS = [-3, -2, -1, 1, 2, 3]

type Caption = {
  id: string
  content: string | null
  created_datetime_utc: string
  imageUrl: string | null
}

function PolaroidCard({
  caption,
  tintColor,
  rotation,
}: {
  caption: Caption
  tintColor: string
  rotation: number
}) {
  const [shaking, setShaking] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const handleClick = () => {
    if (revealed || shaking) return
    setShaking(true)
  }

  const handleAnimationEnd = () => {
    setShaking(false)
    setRevealed(true)
  }

  const date = new Date(caption.created_datetime_utc).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className={shaking ? 'polaroid-shake' : ''}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      style={{
        '--rotation': `${rotation}deg`,
        transform: shaking ? undefined : `rotate(${rotation}deg)`,
        cursor: revealed ? 'default' : 'pointer',
        userSelect: 'none',
      } as React.CSSProperties}
    >
      {/* Polaroid frame */}
      <div
        className="bg-white shadow-2xl"
        style={{ width: '200px', padding: '12px 12px 0' }}
      >
        {/* Photo area */}
        <div
          className="relative overflow-hidden"
          style={{
            height: '188px',
            backgroundColor: '#f5e8d5',
            backgroundImage: caption.imageUrl ? `url(${caption.imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Tint overlay — fades out on reveal */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: tintColor,
              opacity: revealed ? 0.07 : 1,
              transition: 'opacity 1.3s ease',
            }}
          />
        </div>

        {/* White label area */}
        <div style={{ padding: '10px 4px 14px', minHeight: '76px' }}>
          <p
            className="text-xs leading-[1.55] line-clamp-3 text-gray-800"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            {caption.content ?? '—'}
          </p>
          <p
            className="text-gray-400 mt-2"
            style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '9px' }}
          >
            {date}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PolaroidGrid({ captions }: { captions: Caption[] }) {
  if (captions.length === 0) {
    return (
      <p
        className="text-center text-gray-500 mt-20 text-sm"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        No captions found.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-12 px-8 py-12">
      {captions.map((caption, i) => (
        <PolaroidCard
          key={caption.id}
          caption={caption}
          tintColor={TINTS[i % TINTS.length]}
          rotation={ROTATIONS[i % ROTATIONS.length]}
        />
      ))}
    </div>
  )
}
