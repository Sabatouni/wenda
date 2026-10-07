'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PlaceImageProps extends Omit<ImageProps, 'src' | 'fill' | 'width' | 'height'> {
  src?: string | null
}

// Fill-mode image with a shimmer skeleton while loading, a fade-in on load
// and a plain sand fallback when the source is missing or fails.
// The parent must be `relative` with a defined size.
export default function PlaceImage({ src, alt, className, ...props }: PlaceImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  if (!src || status === 'error') {
    return (
      <div role="img" aria-label={alt} className="absolute inset-0 bg-sand-300" />
    )
  }

  return (
    <>
      {status === 'loading' && <span aria-hidden className="absolute inset-0 skeleton" />}
      <Image
        {...props}
        src={src}
        alt={alt}
        fill
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'object-cover transition-[opacity,transform] duration-500 ease-smooth',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </>
  )
}
