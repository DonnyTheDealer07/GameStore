import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import Button from '../button/button'
import { PriceDisplay } from './Layout'
import ProductCard from './ProductCard'
import { ProductPurchase, ProductRating } from './ProductPurchase'

function QuickView({ product, onClose, onMove }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])

  function dismiss() {
    dialog.current.close()
    onClose()
  }

  return (
    <dialog
      className="quick-view"
      ref={dialog}
      aria-labelledby="quick-view-title"
      onCancel={(event) => {
        event.preventDefault()
        dismiss()
      }}
      onClick={(event) => { if (event.target === event.currentTarget) dismiss() }}
    >
      <div className="quick-view__layout">
        <button className="store-icon-button quick-view__close" type="button" aria-label="Close quick view" onClick={dismiss}><X size={20} aria-hidden="true" /></button>
        <img src={product.detailImages?.[0] ?? product.images[0]} alt={product.name} width="311" height="207" />
        <div className="quick-view__copy">
          <div className="product-card__meta"><p>{product.categoryName}</p><ProductRating rating={product.rating} /></div>
          <h2 id="quick-view-title">{product.name}</h2>
          <PriceDisplay amount={product.price} />
          <p>{product.description}</p>
          <ProductPurchase product={product} onMove={onMove && ((id) => {
            dismiss()
            onMove(id)
          })} />
          <Button to={`/product/${product.slug}`} variant="ghost" onClick={dismiss}>View product details</Button>
        </div>
      </div>
    </dialog>
  )
}

export default function ProductGrid({ products, onMove }) {
  const [preview, setPreview] = useState(null)
  return (
    <>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onMove={onMove} onQuickView={(item, move) => setPreview({ item, move })} />
        ))}
      </div>
      {preview && <QuickView key={preview.item.id} product={preview.item} onMove={preview.move} onClose={() => setPreview(null)} />}
    </>
  )
}
