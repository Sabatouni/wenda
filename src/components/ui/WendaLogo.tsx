import Image from 'next/image'
import { cn } from '@/lib/utils'

interface WendaLogoProps {
  /** Rendered height in px — width follows the asset's 3:2 ratio */
  height?: number
  priority?: boolean
  className?: string
}

// The approved WENDA logo: public/wenda-logo.png (1536×1024), used as supplied.
// The artwork is cream on a transparent background, so it sits on a forest
// tile to stay visible on the app's light surfaces.
export default function WendaLogo({ height = 32, priority, className }: WendaLogoProps) {
  return (
    <span className={cn('inline-flex shrink-0 overflow-hidden rounded-md bg-forest-900', className)}>
      <Image
        src="/wenda-logo.png"
        alt="WENDA"
        width={Math.round(height * 1.5)}
        height={height}
        priority={priority}
      />
    </span>
  )
}
