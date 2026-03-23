'use client'

import { useState } from 'react'
import PolaroidGrid from './PolaroidGrid'
import UploadButton from './UploadButton'
import type { Caption } from '@/app/types'

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

  const handleNewCaptions = (newCaptions: Caption[]) => {
    setCaptions((prev) => [...newCaptions, ...prev])
  }

  return (
    <>
      {/* Upload / Login button — sits just below fairy lights */}
      <div className="flex justify-center pt-3 pb-1">
        {accessToken ? (
          <UploadButton accessToken={accessToken} onCaptionsGenerated={handleNewCaptions} />
        ) : (
          <a
            href="/login"
            className="flex items-center gap-2 rounded-full px-4 py-2 transition-colors"
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

      <h1
        className="text-center text-white/70 text-lg tracking-[0.3em] pt-3 pb-2"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        SHAKE TO REVEAL PHOTO
      </h1>

      <PolaroidGrid captions={captions} profileId={profileId} />
    </>
  )
}
