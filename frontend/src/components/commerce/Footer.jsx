import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../BrandLogo'
import Button from '../button/button'
import { useCategories } from '../../api/catalog'

function Newsletter() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <form className="footer-newsletter" onSubmit={(event) => {
      event.preventDefault()
      event.currentTarget.reset()
      setSubmitted(true)
    }}>
      <label htmlFor="newsletter-email">Newsletter preview</label>
      <p id="newsletter-hint">Try the signup form with a sample email.</p>
      <div className="footer-newsletter__controls">
        <input id="newsletter-email" type="email" placeholder="Your email address" autoComplete="email" aria-describedby="newsletter-hint" required onChange={() => setSubmitted(false)} />
        <Button type="submit" size="small">Sign up</Button>
      </div>
      <p className="footer-newsletter__status" role="status">{submitted ? 'Email validated for this demo.' : ''}</p>
    </form>
  )
}

export default function Footer() {
  const { data: categories = [] } = useCategories()
  return (
    <footer className="store-footer">
      <div className="store-shell">
        <div className="store-footer__grid">
          <div className="store-footer__brand">
            <Link to="/" className="brand-link" aria-label="Neonbyte home">
              <BrandLogo alt="" />
            </Link>
            <p>Level up your reality.</p>
            <section aria-label="Contact information" className="store-footer__contact">
              <h2>Contact</h2>
              <p>hello@neonbyte.example<br />Demo contact address</p>
            </section>
          </div>
          <nav aria-label="Footer navigation">
            <h2>Explore</h2>
            <Link to="/shop" state={{ scrollToTop: true }}>Shop</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/about">About</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
          </nav>
          <nav aria-label="Footer categories">
            <h2>Categories</h2>
            {categories.map((category) => <Link key={category.id} to={`/shop?category=${category.id}`} state={{ scrollToTop: true }}>{category.name}</Link>)}
            {!categories.length && <Link to="/collections">View collections</Link>}
          </nav>
          <Newsletter />
        </div>
        <p className="store-footer__fineprint">© NEONBYTE. Fictional gaming gear store and simulated checkout.</p>
      </div>
    </footer>
  )
}
