import { supabase } from '@/lib/supabase'
import PolaroidGrid from './components/PolaroidGrid'

const BULB_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4']
const BULB_COUNT = 30

function FairyLights() {
  return (
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
            {/* Cap */}
            <div
              style={{
                width: '6px',
                height: '4px',
                backgroundColor: '#4b4b55',
                margin: '0 auto',
                borderRadius: '2px 2px 0 0',
              }}
            />
            {/* Bulb */}
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
  )
}

export default async function Home() {
  const { data: raw, error } = await supabase
    .from('captions')
    .select('id, content, created_datetime_utc, images(url)')
    .eq('is_public', true)
    .not('content', 'is', null)
    .order('created_datetime_utc', { ascending: false })
    .limit(50)

  const captions = (raw ?? []).map((row) => ({
    id: row.id,
    content: row.content,
    created_datetime_utc: row.created_datetime_utc,
    imageUrl: (row.images as unknown as { url: string | null } | null)?.url ?? null,
  }))

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: '#111118' }}
    >
      <FairyLights />

      <h1
        className="text-center text-white/70 text-lg tracking-[0.3em] pt-4 pb-2"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        SHAKE TO REVEAL PHOTO
      </h1>

      {error ? (
        <p className="text-center text-red-400 font-mono text-sm mt-10">
          Error: {error.message}
        </p>
      ) : (
        <PolaroidGrid captions={captions} />
      )}
    </main>
  )
}
