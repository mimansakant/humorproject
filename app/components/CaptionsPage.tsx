'use client'

import { useState, useSyncExternalStore } from 'react'
import PolaroidGrid from './PolaroidGrid'
import UploadButton from './UploadButton'
import type { Caption } from '@/app/types'

type SortMode = 'top' | 'newest'

function subscribeToPointerChanges(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const media = window.matchMedia('(pointer: coarse)')
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getCanShakeSnapshot() {
  if (typeof window === 'undefined') return false
  return 'DeviceMotionEvent' in window && window.matchMedia('(pointer: coarse)').matches
}

export default function CaptionsPage({
  initialCaptions,
  profileId,
  accessToken,
}: {
  initialCaptions: Caption[]
  profileId: string | null
  accessToken: string | null
}) {
  const [captions, setCaptions] = useState<Caption[]>(initialCaptions)
  const [sortMode, setSortMode] = useState<SortMode>('top')
  const canShake = useSyncExternalStore(subscribeToPointerChanges, getCanShakeSnapshot, () => false)

  const handleNewCaptions = (newCaptions: Caption[]) => {
    setCaptions((prev) => [...newCaptions, ...prev])
  }

  const handleVoteChange = (captionId: string, nextVote: 1 | -1 | null, nextCount: number) => {
    setCaptions((prev) => prev.map((caption) => (
      caption.id === captionId
        ? { ...caption, likeCount: nextCount, userVote: nextVote }
        : caption
    )))
  }

  const sortedCaptions = [...captions].sort((a, b) => {
    if (sortMode === 'newest') {
      return new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()
    }

    if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount
    return new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()
  })

  const topCaption = sortedCaptions[0]

  return (
    <>
      {/* Upload / Login button — sits just below fairy lights */}
      <div className="flex justify-center pt-3 pb-1">
        {accessToken ? (
          <UploadButton accessToken={accessToken} onCaptionsGenerated={handleNewCaptions} />
        ) : (
          <a
            href="/login"
            className="flex items-center gap-2 rounded-full px-4 py-2 transition-all hover:brightness-110 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.65)',
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textDecoration: 'none',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            sign in
          </a>
        )}
      </div>

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 pt-4 text-center">
        <div>
          <h1
            className="text-white/80 text-lg tracking-[0.3em]"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            CAPTION RANKINGS
          </h1>
          <p
            className="mt-2 max-w-xl text-xs leading-5 text-white/45"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            Vote with the arrows. Scores update instantly, and Top ranked reorders by the crowd favorite. Cards marked voted are ones you have already rated.
          </p>
        </div>

        <div
          className="inline-flex rounded-full p-1"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
          }}
          aria-label="Caption sort"
        >
          {(['top', 'newest'] as SortMode[]).map((mode) => {
            const active = sortMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                  fontFamily: '"Courier New", Courier, monospace',
                }}
              >
                {mode === 'top' ? 'Top ranked' : 'Newest'}
              </button>
            )
          })}
        </div>

        {topCaption && sortMode === 'top' && (
          <p
            className="text-[11px] text-white/45"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            Current leader: {topCaption.likeCount > 0 ? '+' : ''}{topCaption.likeCount} points
          </p>
        )}
      </section>

      <h1
        className="text-center text-white/55 text-sm tracking-[0.24em] pt-8 pb-2"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        {canShake ? 'TAP OR SHAKE PHONE TO REVEAL PHOTO' : 'CLICK A POLAROID TO REVEAL PHOTO'}
      </h1>

      <PolaroidGrid
        captions={sortedCaptions}
        profileId={profileId}
        sortMode={sortMode}
        onVoteChange={handleVoteChange}
      />
    </>
  )
}
