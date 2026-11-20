import { Eye, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../button/button'
import { useCommerce } from '../../store/commerce'
import { PriceDisplay } from './Layout'
import { ProductRating, WishlistButton } from './ProductPurchase'

export default function ProductCard({ product, onQuickView, onMove }) {
  const { available, addToCart } = useCommerce()
  const quantity = available(product)
  const detailsPath = `/product/${product.slug}`

  function handlePurchase() {
    if (product.variants) {
      onQuickView(product, onMove)
    } else if (addToCart(product)) {
      onMove?.(product.id)
    }
  }

  return (
    <article className="product-card">
      <div className="product-card__visual">
        <Link to={detailsPath} className="product-card__image" aria-label={`View ${product.name}`}>
          <img
            src={product.images[0]}
            srcSet={product.detailImages ? `${product.images[0]} 311w, ${product.detailImages[0]} 764w` : undefined}
            sizes="(max-width: 360px) 90vw, (max-width: 1100px) 42vw, 25vw"
            alt=""
            width="311"
            height="207"
            loading="lazy"
            decoding="async"
          />
        </Link>
        {(product.badge || !product.stock) && <span className="product-badge">{product.stock ? product.badge : 'Out of demo stock'}</span>}
        <WishlistButton product={product} />
      </div>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.categoryName}</span>
          <ProductRating rating={product.rating} />
        </div>
        <h3><Link to={detailsPath}>{product.name}</Link></h3>
        <PriceDisplay amount={product.price} />
        <div className="product-card__actions">
          <Button variant="outline" size="small" disabled={!quantity} onClick={handlePurchase}>
            <ShoppingBag size={15} aria-hidden="true" />
            {quantity ? (onMove ? 'Move to cart' : 'Add to cart') : (product.stock ? 'Stock in cart' : 'Unavailable')}
          </Button>
          <button type="button" className="store-icon-button" aria-label={`Quick view ${product.name}`} onClick={() => onQuickView(product)}>
            <Eye size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
