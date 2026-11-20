import { Link } from 'react-router-dom'
import Button from '../button/button'
import { mediaUrl } from '../../api/media'
import { formatPrice } from '../../store/commerce'

export function PageHeader({ title, description, eyebrow, children }) {
  return (
    <header className="page-header">
      <div className="store-shell page-header__inner">
        {eyebrow && <p className="store-kicker">{eyebrow}</p>}
        <h1>{title}<span aria-hidden="true">.</span></h1>
        {description && <p className="page-header__copy">{description}</p>}
        {children}
      </div>
    </header>
  )
}

export function SectionHeading({ title, description, action, id }) {
  return (
    <div className="section-heading">
      <div>
        <h2 id={id}>{title}<span aria-hidden="true">.</span></h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><Icon size={28} aria-hidden="true" /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  )
}

export function PriceDisplay({ amount, className = '' }) {
  return <span className={`store-price ${className}`}>{formatPrice(amount)}</span>
}

export function CategoryCard({ category }) {
  return (
    <Link className="category-card" to={`/shop?category=${category.id}`}>
      <img src={mediaUrl(`/categories/${category.id}.webp`)} alt="" width="764" height="252" loading="lazy" decoding="async" />
      <div className="category-card__info">
        <h3>{category.name}</h3>
        <p>{category.copy}</p>
      </div>
    </Link>
  )
}

export function OrderSummary({ totals, children, shippingLabel = 'Shipping estimate' }) {
  return (
    <aside className="order-summary" aria-label="Order summary">
      <h2>Order summary</h2>
      <dl>
        <div><dt>Subtotal</dt><dd><PriceDisplay amount={totals.subtotal} /></dd></div>
        <div><dt>{shippingLabel}</dt><dd>{totals.shipping ? <PriceDisplay amount={totals.shipping} /> : 'Free'}</dd></div>
        <div className="order-summary__total"><dt>Total <small>ZAR</small></dt><dd><PriceDisplay amount={totals.total} /></dd></div>
      </dl>
      {children}
    </aside>
  )
}

export function ShopButton({ children = 'Browse the shop' }) {
  return <Button to="/shop">{children}</Button>
}
