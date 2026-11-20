import './BrandLogo.css'

const full = { src: '/branding/neonbyte-logo.svg', width: 212 }
const compact = { src: '/branding/neonbyte-icon.svg', width: 48 }
const height = 48

export default function BrandLogo({
  variant = 'full',
  size = 36,
  className = '',
  alt = 'NEONBYTE',
  compactOnNarrow = false,
}) {
  const asset = variant === 'compact' ? compact : full
  const logoHeight = typeof size === 'number' ? `${size}px` : size

  return (
    <picture className={`brand-logo ${className}`.trim()} style={{ '--brand-logo-height': logoHeight }}>
      {compactOnNarrow && asset === full && (
        <source media="(max-width: 304px)" srcSet={compact.src} width={compact.width} height={height} />
      )}
      <img src={asset.src} alt={alt} width={asset.width} height={height} />
    </picture>
  )
}
