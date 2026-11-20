import { useEffect, useRef } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/navbar/navbar'
import Footer from './components/commerce/Footer'
import Home from './Pages/home/home'
import Shop from './Pages/store/Shop'
import ProductDetail from './Pages/store/ProductDetail'
import Collections from './Pages/store/Collections'
import Cart from './Pages/store/Cart'
import Wishlist from './Pages/store/Wishlist'
import Checkout, { Confirmation } from './Pages/store/Checkout'
import { About, NotFound } from './Pages/store/Brand'
import { catalogClient } from './api/catalog'
import CommerceProvider from './store/CommerceProvider'
import { useCommerce } from './store/commerce'
import './store.css'

const titles = {
  '/': 'Level Up Your Reality',
  '/shop': 'Shop',
  '/collections': 'Collections',
  '/cart': 'Cart',
  '/wishlist': 'Wishlist',
  '/checkout': 'Demo Checkout',
  '/checkout/confirmation': 'Demo Order Confirmation',
  '/about': 'Our Story',
}

function PageNavigation() {
  const { pathname, key, state } = useLocation()
  const scrollRequest = state?.scrollToTop ? key : null
  const previousPath = useRef(null)

  useEffect(() => {
    const initial = previousPath.current === null
    if (previousPath.current === pathname && !scrollRequest) return
    previousPath.current = pathname
    const path = pathname.replace(/\/$/, '') || '/'
    document.title = `${titles[path] ?? (path.startsWith('/product/') ? 'Product' : 'Page Not Found')} | NEONBYTE`
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (!initial) {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
  }, [pathname, scrollRequest])

  return null
}

function CartFeedback() {
  const { notice } = useCommerce()
  return (
    <div className="cart-feedback" role="status">
      {notice && <div className="cart-feedback__message"><Check size={18} aria-hidden="true" />{notice.message}</div>}
    </div>
  )
}

function Storefront() {
  return (
    <CommerceProvider>
      <PageNavigation />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/confirmation" element={<Confirmation />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CartFeedback />
    </CommerceProvider>
  )
}

export default function App() {
  return <QueryClientProvider client={catalogClient}><Storefront /></QueryClientProvider>
}
