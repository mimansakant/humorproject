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
      {accessToken && (
        <UploadButton accessToken={accessToken} onCaptionsGenerated={handleNewCaptions} />
      )}
      <PolaroidGrid captions={captions} profileId={profileId} />
    </>
  )
}
