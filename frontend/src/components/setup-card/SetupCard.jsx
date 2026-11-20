
import { Link } from 'react-router-dom'
import { mediaUrl } from '../../api/media'
import './SetupCard.css'

export default function SetupCard({
  image,
  title,
  subtitle,
  to = '/collections',
  accent = 'pink',
}) {
  return (
    <article className={`setup-card setup-card--${accent}`}>
      <Link
        to={to}
        className="setup-card__link"
        aria-label={`Explore ${title}`}
      >
        <div className="setup-card__image-wrap">
          <img
            src={mediaUrl(image)}
            alt={`${title} gaming setup`}
            className="setup-card__image"
            loading="lazy"
            decoding="async"
          />

          <div className="setup-card__ambient" />
          <div className="setup-card__shade" />

          <span
            className="setup-card__corner-icon"
            aria-hidden="true"
          >
            ↗
          </span>

          <div className="setup-card__content">
            <h3 className="setup-card__title">
              {title}
            </h3>

            <p className="setup-card__subtitle">
              {subtitle}
            </p>

            <span className="setup-card__explore">
              Explore setup
              <span aria-hidden="true">↗</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
