'use client'

import { useState, useTransition } from 'react'
import { castVote } from '@/app/actions/vote'
import type { Caption } from '@/app/types'

const TINTS = ['#7c3aed', '#0e7490', '#065f46', '#9d174d', '#92400e', '#1e3a5f']
const ROTATIONS = [-3, -2, -1, 1, 2, 3]

function VoteOverlay({
  captionId,
  initialCount,
  initialVote,
  disabled,
}: {
  captionId: string
  initialCount: number
  initialVote: 1 | -1 | null
  disabled: boolean
}) {
  const [voteCount, setVoteCount] = useState(initialCount)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialVote)
  const [isPending, startTransition] = useTransition()

  const handleVote = (value: 1 | -1) => {
    if (isPending) return
    if (disabled) {
      window.location.href = '/login'
      return
    }

    const newVote: 1 | -1 | 0 = userVote === value ? 0 : value
    const prevVote = userVote
    const prevCount = voteCount

    // Optimistic update
    if (newVote === 0) {
      setVoteCount((c) => c - (prevVote ?? 0))
      setUserVote(null)
    } else if (prevVote !== null) {
      setVoteCount((c) => c + newVote * 2)
      setUserVote(newVote)
    } else {
      setVoteCount((c) => c + newVote)
      setUserVote(newVote)
    }

    startTransition(async () => {
      try {
        await castVote(captionId, newVote)
      } catch {
        // Revert on error
        setVoteCount(prevCount)
        setUserVote(prevVote)
      }
    })
  }

  return (
    <div
      className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2 py-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 10 }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); handleVote(1) }}
        disabled={isPending}
        title={disabled ? 'Sign in to vote' : undefined}
        className="text-xs leading-none transition-all hover:scale-125 hover:brightness-150 active:scale-90 disabled:opacity-40"
        style={{ color: userVote === 1 ? '#4ade80' : 'rgba(255,255,255,0.6)' }}
      >
        ▲
      </button>
      <span
        className="text-white text-[10px] min-w-[16px] text-center tabular-nums"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        {voteCount}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); handleVote(-1) }}
        disabled={isPending}
        title={disabled ? 'Sign in to vote' : undefined}
        className="text-xs leading-none transition-all hover:scale-125 hover:brightness-150 active:scale-90 disabled:opacity-40"
        style={{ color: userVote === -1 ? '#f87171' : 'rgba(255,255,255,0.6)' }}
      >
        ▼
      </button>
    </div>
  )
}

function PolaroidCard({
  caption,
  tintColor,
  rotation,
  profileId,
}: {
  caption: Caption
  tintColor: string
  rotation: number
  profileId: string | null
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
        className="bg-white"
        style={{
          width: '200px',
          padding: '12px 12px 0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
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

          {/* Vote overlay */}
          <VoteOverlay
            captionId={caption.id}
            initialCount={caption.likeCount}
            initialVote={caption.userVote}
            disabled={!profileId}
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

export default function PolaroidGrid({
  captions,
  profileId,
}: {
  captions: Caption[]
  profileId: string | null
}) {
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
          profileId={profileId}
        />
      ))}
    </div>
  )
}
