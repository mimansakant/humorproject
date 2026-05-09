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
  onVoteChange,
}: {
  captionId: string
  initialCount: number
  initialVote: 1 | -1 | null
  disabled: boolean
  onVoteChange: (captionId: string, nextVote: 1 | -1 | null, nextCount: number) => void
}) {
  const [voteCount, setVoteCount] = useState(initialCount)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialVote)
  const [status, setStatus] = useState('')
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
    let nextVote: 1 | -1 | null = null
    let nextCount = voteCount

    // Optimistic update
    if (newVote === 0) {
      nextCount = voteCount - (prevVote ?? 0)
      nextVote = null
    } else if (prevVote !== null) {
      nextCount = voteCount + newVote * 2
      nextVote = newVote
    } else {
      nextCount = voteCount + newVote
      nextVote = newVote
    }

    setVoteCount(nextCount)
    setUserVote(nextVote)
    onVoteChange(captionId, nextVote, nextCount)
    setStatus(newVote === 0 ? 'Vote removed' : newVote === 1 ? 'Upvoted' : 'Downvoted')

    startTransition(async () => {
      try {
        await castVote(captionId, newVote)
      } catch {
        // Revert on error
        setVoteCount(prevCount)
        setUserVote(prevVote)
        onVoteChange(captionId, prevVote, prevCount)
        setStatus('Vote failed')
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
      <span className="sr-only" aria-live="polite">{status}</span>
    </div>
  )
}

function PolaroidCard({
  caption,
  tintColor,
  rotation,
  profileId,
  rank,
  sortMode,
  onVoteChange,
}: {
  caption: Caption
  tintColor: string
  rotation: number
  profileId: string | null
  rank: number
  sortMode: 'top' | 'newest'
  onVoteChange: (captionId: string, nextVote: 1 | -1 | null, nextCount: number) => void
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
            onVoteChange={onVoteChange}
          />
        </div>

        {/* White label area */}
        <div style={{ padding: '10px 4px 14px', minHeight: '76px' }}>
          <div
            className="mb-2 flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.14em]"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            <span className="text-gray-500">{sortMode === 'top' ? `rank #${rank}` : 'new'}</span>
            <span className={caption.likeCount >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              {caption.likeCount > 0 ? '+' : ''}{caption.likeCount} pts
            </span>
          </div>
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
  sortMode,
  onVoteChange,
}: {
  captions: Caption[]
  profileId: string | null
  sortMode: 'top' | 'newest'
  onVoteChange: (captionId: string, nextVote: 1 | -1 | null, nextCount: number) => void
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
          rank={i + 1}
          sortMode={sortMode}
          onVoteChange={onVoteChange}
        />
      ))}
    </div>
  )
}
