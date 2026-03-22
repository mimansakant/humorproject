import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type ImageRow = {
  id: string
  url: string | null
  image_description: string | null
  additional_context: string | null
  created_datetime_utc: string
  is_common_use: boolean
}

function ImageCard({ image }: { image: ImageRow }) {
  const date = new Date(image.created_datetime_utc).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 flex flex-col">
      {image.url ? (
        <div className="relative w-full aspect-video bg-neutral-100">
          <Image
            src={image.url}
            alt={image.image_description ?? 'Image'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">
          No image
        </div>
      )}
      <div className="p-4 flex flex-col gap-1 flex-1">
        {image.image_description && (
          <p className="text-sm font-medium text-neutral-800 line-clamp-2">
            {image.image_description}
          </p>
        )}
        {image.additional_context && (
          <p className="text-xs text-neutral-500 line-clamp-2">{image.additional_context}</p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-neutral-400">
          <span>{date}</span>
          {image.is_common_use && (
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              Common use
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function Home() {
  const { data: images, error } = await supabase
    .from('images')
    .select('id, url, image_description, additional_context, created_datetime_utc, is_common_use')
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-red-600 font-mono text-sm">Error: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <h1 className="text-2xl font-semibold text-neutral-800 mb-6">
        Images
        {images && (
          <span className="ml-2 text-sm font-normal text-neutral-400">({images.length})</span>
        )}
      </h1>
      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">No images found.</p>
      )}
    </main>
  )
}
