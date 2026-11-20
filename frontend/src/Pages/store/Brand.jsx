import { Gamepad2 } from 'lucide-react'
import { mediaUrl } from '../../api/media'
import Button from '../../components/button/button'
import { EmptyState, PageHeader } from '../../components/commerce/Layout'
import PageHero from '../../components/commerce/PageHero'
import useReveal from '../../components/commerce/useReveal'

export function About() {
  const editorial = useReveal()
  return (
    <main className="store-page" id="main-content" tabIndex={-1}>
      <PageHero title="Built different" eyebrow="About NEONBYTE" description="For the late nights, big plays, and setups that feel like home." />
      <div className="store-shell store-section about-story" ref={editorial}>
        <div className="about-story__lead">
          <img
            src={mediaUrl('/editorial/about.webp')}
            srcSet={`${mediaUrl('/editorial/about-640.webp')} 640w, ${mediaUrl('/editorial/about.webp')} 1280w`}
            sizes="(max-width: 690px) 95vw, min(50vw, 740px)"
            alt="A gamer wearing headphones at a neon-lit desk"
            width="1280"
            height="854"
            loading="lazy"
            decoding="async"
          />
          <section aria-labelledby="story-heading">
            <p className="store-kicker">The brand</p>
            <h2 id="story-heading">A setup worth coming back to<span>.</span></h2>
            <p>NEONBYTE grew out of a familiar ritual: the day winds down, the room goes quiet, and the desk becomes your favourite place to be. We took the colour of old arcade cabinets and paired it with the clean shapes and practical details we like in modern gear.</p>
            <p>The result is a fictional gaming catalog for people who care as much about how their setup feels as how it looks.</p>
          </section>
        </div>
        <section className="about-mission" aria-labelledby="mission-heading" data-reveal>
          <p className="store-kicker">Our mission</p>
          <h2 id="mission-heading">Make your space your own<span>.</span></h2>
          <p>Help players put together a setup they enjoy using every day, from the first keystroke to the last round.</p>
          <Button to="/shop">Explore the shop</Button>
        </section>
      </div>
    </main>
  )
}

export function NotFound({ missingProduct = false }) {
  return (
    <main className="store-page not-found" id="main-content" tabIndex={-1}>
      <PageHeader title="404" eyebrow={missingProduct ? 'Product unavailable' : 'Page unavailable'} />
      <div className="store-shell store-section">
        <EmptyState icon={Gamepad2} title={missingProduct ? 'Product not found' : 'Page not found'} description={missingProduct ? 'That product is missing from the demo catalog.' : 'The page you were looking for could not be found.'}>
          <Button to="/">Return to homepage</Button>
        </EmptyState>
      </div>
    </main>
  )
}
