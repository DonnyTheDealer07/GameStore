import { useState } from 'react'
import { Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import Button from '../button/button'
import { useCommerce } from '../../store/commerce'

export function WishlistButton({ product }) {
  const { wishlist, toggleWishlist } = useCommerce()
  const saved = wishlist.includes(product.id)

  return (
    <button
      className={`store-icon-button wishlist-button${saved ? ' is-saved' : ''}`}
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${product.name} to wishlist`}
      onClick={() => toggleWishlist(product)}
    >
      <Heart size={19} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}

export function QuantitySelector({ value, max, onChange, label = 'Quantity' }) {
  return (
    <div className="quantity" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus size={16} aria-hidden="true" />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export function ProductRating({ rating }) {
  return (
    <span className="product-rating" aria-label={`Demo rating: ${rating} out of 5`} title="Illustrative demo rating">
      <Star size={14} fill="currentColor" aria-hidden="true" /> {rating.toFixed(1)}
    </span>
  )
}

export function ProductPurchase({ product, onMove }) {
  const { addToCart, available } = useCommerce()
  const [variant, setVariant] = useState(product.variants?.[0] ?? null)
  const [quantity, setQuantity] = useState(1)
  const remaining = available(product)
  const selectedQuantity = Math.min(quantity, remaining || 1)

  return (
    <div className="purchase">
      {product.variants && (
        <fieldset className="purchase__variants">
          <legend>Switch type</legend>
          <div>
            {product.variants.map((option) => (
              <label className="store-chip" key={option}>
                <input type="radio" name="variant" checked={variant === option} onChange={() => setVariant(option)} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <p className={`stock-label${remaining ? '' : ' stock-label--unavailable'}`}>
        {remaining > 0 ? `${remaining} available in demo inventory` : product.stock ? 'All available demo units are in your cart' : 'Out of demo stock'}
      </p>
      <div className="purchase__actions">
        <QuantitySelector value={selectedQuantity} max={remaining} onChange={setQuantity} />
        <Button disabled={!remaining} onClick={() => {
          if (addToCart(product, selectedQuantity, variant)) {
            setQuantity(1)
            onMove?.(product.id)
          }
        }}>
          <ShoppingBag size={17} aria-hidden="true" />
          {onMove ? 'Move to cart' : 'Add to cart'}
        </Button>
        <WishlistButton product={product} />
      </div>
    </div>
  )
}
