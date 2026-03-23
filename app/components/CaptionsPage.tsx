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
      {/* Upload button — sits just below fairy lights */}
      <div className="flex justify-center pt-3 pb-1">
        {accessToken && (
          <UploadButton accessToken={accessToken} onCaptionsGenerated={handleNewCaptions} />
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
