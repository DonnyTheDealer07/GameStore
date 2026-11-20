import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCommerce } from '../../store/commerce'
import { PriceDisplay } from './Layout'
import { QuantitySelector } from './ProductPurchase'

export default function CartItem({ line }) {
  const { available, setQuantity, removeLine } = useCommerce()
  const { product, variant, quantity, key } = line
  const path = `/product/${product.slug}`

  return (
    <li className="cart-item">
      <Link to={path} className="cart-item__image" aria-label={`View ${product.name}`}>
        <img src={product.images[0]} alt="" width="120" height="80" />
      </Link>
      <div className="cart-item__description">
        <p>{product.categoryName}</p>
        <h2><Link to={path}>{product.name}</Link></h2>
        <p>{variant && `${variant} · `}<PriceDisplay amount={product.price} /> each</p>
      </div>
      <QuantitySelector value={quantity} max={quantity + available(product)} label={`${product.name}${variant ? ` ${variant}` : ''} quantity`} onChange={(value) => setQuantity(key, value)} />
      <PriceDisplay className="cart-item__total" amount={product.price * quantity} />
      <button type="button" className="store-icon-button" aria-label={`Remove ${product.name}${variant ? ` ${variant}` : ''}`} onClick={() => removeLine(key)}>
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </li>
  )
}
