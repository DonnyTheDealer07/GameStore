
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import BrandLogo from '../BrandLogo'
import Button from '../button/button'
import { useCommerce } from '../../store/commerce'
import './navbar.css'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Collections', path: '/collections' },
  { label: 'About', path: '/about' },
]

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  )
}

export default function Navbar() {
  const header = useRef(null)
  const menuToggle = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [openLocation, setOpenLocation] = useState(null)
  const location = useLocation()
  const menuOpen = openLocation === location.key
  const { cartCount } = useCommerce()
  const path = location.pathname.replace(/\/+$/, '').toLowerCase()
  const cartAction = path === '/shop' || path === '/collections'
  const actionPath = cartAction ? '/cart' : '/shop'
  const actionLabel = cartAction ? 'View cart' : 'Explore store'

  useEffect(() => {
    const navbar = header.current
    const root = document.documentElement
    const measure = () => {
      root.style.setProperty('--navbar-current-height', `${navbar.getBoundingClientRect().height}px`)
    }
    const observer = new ResizeObserver(measure)
    measure()
    observer.observe(navbar, { box: 'border-box' })
    return () => {
      observer.disconnect()
      root.style.removeProperty('--navbar-current-height')
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 35)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenLocation(null)
        menuToggle.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  return (
    <header
      ref={header}
      className={[
        'navbar',
        scrolled ? 'navbar--scrolled' : '',
        menuOpen ? 'navbar--open' : '',
      ].join(' ')}
    >
      <div className="navbar__inner">
        <Link
          to="/"
          className="brand-link navbar__brand"
          aria-label="Neonbyte home"
          onClick={() => setOpenLocation(null)}
        >
          <BrandLogo size="var(--navbar-brand-height)" compactOnNarrow alt="" />
        </Link>

        <nav className="navbar__links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link
            to="/cart"
            className="navbar__cart"
            aria-label={`View shopping cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
            onClick={() => setOpenLocation(null)}
          >
            <CartIcon />
            <span className="navbar__cart-count" aria-hidden="true">{cartCount}</span>
          </Link>

          <div className="navbar__desktop-button">
            <Button to={actionPath} variant="primary" size="small">
              {actionLabel}
              <span aria-hidden="true">↗</span>
            </Button>
          </div>

          <button
            ref={menuToggle}
            className={`navbar__menu-toggle ${
              menuOpen ? 'navbar__menu-toggle--open' : ''
            }`}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setOpenLocation(menuOpen ? null : location.key)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}
        aria-label="Mobile navigation"
        inert={!menuOpen}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `navbar__mobile-link ${
                isActive ? 'navbar__mobile-link--active' : ''
              }`
            }
            onClick={() => setOpenLocation(null)}
          >
            {link.label}
            <span aria-hidden="true">↗</span>
          </NavLink>
        ))}

        <Button
          to={actionPath}
          variant="primary"
          size="medium"
          className="navbar__mobile-cta"
          onClick={() => setOpenLocation(null)}
        >
          {actionLabel}
        </Button>
      </nav>
    </header>
  )
}
