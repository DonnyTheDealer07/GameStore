
import { useEffect, useState } from 'react'
import { heroPoster, heroVideo } from '../../api/media'
import Button from '../../components/button/button'
import SetupCard from '../../components/setup-card/SetupCard'
import HomeStore from './HomeStore'
import './home.css'

const setups = [
  {
    title: 'Minimal',
    subtitle: 'Clean design. Maximum focus.',
    image: '/setups/setup 1.webp',
    accent: 'cyan',
    to: '/shop?collection=minimal',
  },
  {
    title: 'RGB',
    subtitle: 'Make every colour count.',
    image: '/setups/setup2.webp',
    accent: 'pink',
    to: '/shop?collection=rgb',
  },
  {
    title: 'Pro',
    subtitle: 'Built for the ultimate performance.',
    image: '/setups/setup2.webp',
    accent: 'purple',
    to: '/shop?collection=pro',
  },
]

export default function Home() {
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event) => setReduceMotion(event.matches)
    preference.addEventListener('change', handleChange)
    return () => preference.removeEventListener('change', handleChange)
  }, [])

  return (
    <main className="home" id="main-content" tabIndex={-1}>
      {/* HERO - unchanged */}
      <section
        className="hero"
        aria-labelledby="hero-heading"
      >
        <div className="hero__background" aria-hidden="true">
          {reduceMotion ? <img className="hero__video" src={heroPoster} alt="" fetchPriority="high" /> : <video
            className="hero__video"
            poster={heroPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
          >
            <source src={heroVideo} type="video/mp4" />
          </video>}

          <div className="hero__overlay" />
          <div className="hero__vignette" />
          <div className="hero__grid" />
        </div>

        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line" />
            <span>WELCOME TO THE NEXT LEVEL</span>
          </div>

          <h1
            id="hero-heading"
            className="hero__title"
          >
            LEVEL UP
            <span className="hero__title-second">
              YOUR <span>REALITY.</span>
            </span>
          </h1>

          <p className="hero__description">
            Engineered for the obsessed. Designed for the bold.
            Discover next-level gaming gear that transforms
            every setup into something extraordinary.
          </p>

          <div className="hero__buttons">
            <Button
              to="/shop"
              variant="primary"
              size="large"
            >
              Shop the drop
              <span aria-hidden="true">↗</span>
            </Button>

            <Button
              to="/collections"
              variant="outline"
              size="large"
            >
              Explore collections
              <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </section>

      <section
        className="setups-section"
        aria-labelledby="setups-heading"
      >
        <div className="store-shell">
          <div className="setups-section__heading">
            <div className="setups-section__heading-content">
              <h2 id="setups-heading">
                Make it yours<span>.</span>
              </h2>

              <p>
                Your space. Your rules. Build a setup that feels like you.
              </p>
            </div>

            <Button
              to="/collections"
              variant="outline"
              size="medium"
              className="setups-section__all-button"
            >
              All collections
              <span aria-hidden="true">↗</span>
            </Button>
          </div>

          <div className="setups-section__grid">
            {setups.map((setup) => (
              <SetupCard
                key={setup.title}
                {...setup}
              />
            ))}
          </div>
        </div>
      </section>
      <HomeStore />
    </main>
  )
}
