import { useEffect, useState } from 'react'
import { heroPoster, heroVideo } from '../../api/media'
import './PageHero.css'

const motionPreference = '(prefers-reduced-motion: reduce)'

export default function PageHero({ eyebrow, title, description }) {
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia(motionPreference).matches)
  const [videoUnavailable, setVideoUnavailable] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia(motionPreference)
    const handleChange = (event) => setReduceMotion(event.matches)
    preference.addEventListener('change', handleChange)
    return () => preference.removeEventListener('change', handleChange)
  }, [])

  return (
    <header className="page-hero">
      <div className="page-hero__media" aria-hidden="true" style={{ '--hero-poster': `url(${JSON.stringify(heroPoster)})` }}>
        {!reduceMotion && !videoUnavailable && (
          <video
            src={heroVideo}
            poster={heroPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            onError={() => setVideoUnavailable(true)}
          />
        )}
      </div>
      <div className="store-shell page-hero__content">
        <p className="store-kicker">{eyebrow}</p>
        <h1>{title}<span aria-hidden="true">.</span></h1>
        <p className="page-hero__copy">{description}</p>
      </div>
    </header>
  )
}
