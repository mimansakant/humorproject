'use client'

import { useState, useRef } from 'react'
import type { Caption } from '@/app/types'

const ACCEPTED_TYPES = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic'
const API_BASE = 'https://api.almostcrackd.ai/pipeline'

const STEPS = [
  'Generating upload URL...',
  'Uploading image...',
  'Processing image...',
  'Generating captions...',
]

export default function UploadButton({
  accessToken,
  onCaptionsGenerated,
}: {
  accessToken: string
  onCaptionsGenerated: (captions: Caption[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFile(null)
    setStep(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    if (step !== null) return
    reset()
    setIsOpen(false)
  }

  const handleSubmit = async () => {
    if (!file || step !== null) return
    setError(null)

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    }

    try {
      console.log('[upload] token (first 20 chars):', accessToken.slice(0, 20) + '...')
      console.log('[upload] file name:', file.name, '| type:', file.type, '| size:', file.size)

      // Step 1: Generate presigned URL
      setStep(0)
      const step1Body = { contentType: file.type }
      console.log('[step1] POST generate-presigned-url body:', step1Body)
      const presignRes = await fetch(`${API_BASE}/generate-presigned-url`, {
        method: 'POST',
        headers,
        body: JSON.stringify(step1Body),
      })
      const presignText = await presignRes.text()
      console.log('[step1] status:', presignRes.status, '| response:', presignText)
      if (!presignRes.ok) throw new Error(`Failed to get upload URL (${presignRes.status}): ${presignText}`)
      const { presignedUrl, cdnUrl } = JSON.parse(presignText)
      console.log('[step1] presignedUrl:', presignedUrl)
      console.log('[step1] cdnUrl:', cdnUrl)

      // Step 2: PUT image bytes directly to presigned URL
      setStep(1)
      console.log('[step2] PUT to presignedUrl with Content-Type:', file.type, '| body: File object, size:', file.size)
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      const putText = await putRes.text()
      console.log('[step2] status:', putRes.status, '| response:', putText)
      if (!putRes.ok) throw new Error(`Failed to upload image (${putRes.status}): ${putText}`)

      // Step 3: Register image from CDN URL
      setStep(2)
      const step3Body = { imageUrl: cdnUrl, isCommonUse: false }
      console.log('[step3] POST upload-image-from-url body:', step3Body)
      const uploadRes = await fetch(`${API_BASE}/upload-image-from-url`, {
        method: 'POST',
        headers,
        body: JSON.stringify(step3Body),
      })
      const uploadText = await uploadRes.text()
      console.log('[step3] status:', uploadRes.status, '| response:', uploadText)
      if (!uploadRes.ok) throw new Error(`Failed to process image (${uploadRes.status}): ${uploadText}`)
      const { imageId } = JSON.parse(uploadText)
      console.log('[step3] imageId:', imageId)

      // Step 4: Generate captions
      setStep(3)
      const step4Body = { imageId }
      console.log('[step4] POST generate-captions body:', step4Body)
      const captionsRes = await fetch(`${API_BASE}/generate-captions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(step4Body),
      })
      const captionsText = await captionsRes.text()
      console.log('[step4] status:', captionsRes.status, '| response:', captionsText)
      if (!captionsRes.ok) throw new Error(`Failed to generate captions (${captionsRes.status}): ${captionsText}`)
      const captionsData = JSON.parse(captionsText)

      const rawCaptions: { id: string; content?: string; created_datetime_utc?: string }[] =
        Array.isArray(captionsData) ? captionsData : (captionsData.captions ?? [])

      const newCaptions: Caption[] = rawCaptions.map((c) => ({
        id: c.id,
        content: c.content ?? null,
        created_datetime_utc: c.created_datetime_utc ?? new Date().toISOString(),
        imageUrl: cdnUrl,
        likeCount: 0,
        userVote: null,
      }))

      reset()
      setIsOpen(false)
      onCaptionsGenerated(newCaptions)
    } catch (err) {
      console.error('[upload] error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setStep(null)
    }
  }

  const mono = { fontFamily: '"Courier New", Courier, monospace' }

  return (
    <>
      {/* Upload button — fixed top-right over fairy lights */}
      <button
        onClick={() => setIsOpen(true)}
        title="Upload photo"
        className="fixed z-20 flex items-center justify-center rounded-full transition-colors"
        style={{
          top: '14px',
          right: '16px',
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.65)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>

      {/* Modal backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={handleClose}
        >
          <div
            className="w-full mx-4 rounded-2xl p-8"
            style={{
              maxWidth: '400px',
              backgroundColor: '#111118',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-white/80 text-sm tracking-[0.2em] mb-6"
              style={mono}
            >
              UPLOAD PHOTO
            </h2>

            {step === null ? (
              <>
                {/* File picker */}
                <label
                  className="flex flex-col items-center justify-center w-full rounded-xl cursor-pointer"
                  style={{
                    height: '120px',
                    border: '1px dashed rgba(255,255,255,0.18)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <span className="text-white/70 text-xs text-center px-4" style={mono}>
                      {file.name}
                    </span>
                  ) : (
                    <>
                      <span className="text-white/40 text-xs mb-1" style={mono}>click to select image</span>
                      <span className="text-white/20 text-[10px]" style={mono}>jpg · png · webp · gif · heic</span>
                    </>
                  )}
                </label>

                {error && (
                  <p className="text-red-400 text-xs mt-4" style={mono}>{error}</p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2 rounded-xl text-xs"
                    style={{
                      ...mono,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.35)',
                    }}
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!file}
                    className="flex-1 py-2 rounded-xl text-xs disabled:opacity-30"
                    style={{
                      ...mono,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    generate captions
                  </button>
                </div>
              </>
            ) : (
              /* Loading steps */
              <div className="py-2">
                {STEPS.map((label, i) => {
                  const done = i < step
                  const active = i === step
                  return (
                    <div key={i} className="flex items-center gap-3 mb-4">
                      {/* Step indicator */}
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: done
                            ? 'rgba(74,222,128,0.2)'
                            : active
                            ? 'rgba(255,255,255,0.1)'
                            : 'transparent',
                          border: `1px solid ${done ? '#4ade80' : active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        {done && (
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {active && (
                          <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                          />
                        )}
                      </div>
                      <span
                        className="text-xs"
                        style={{
                          ...mono,
                          color: done
                            ? 'rgba(74,222,128,0.75)'
                            : active
                            ? 'rgba(255,255,255,0.7)'
                            : 'rgba(255,255,255,0.18)',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
