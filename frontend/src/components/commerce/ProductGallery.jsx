import { useState } from 'react'

export default function ProductGallery({ product }) {
  const [selected, setSelected] = useState(0)
  const selectedImage = (product.detailImages ?? product.images)[selected]
  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <img src={selectedImage} width="311" height="207" alt={`${product.name}, view ${selected + 1}`} />
      </div>
      <div className="product-gallery__thumbs" role="group" aria-label="Product image views">
        {product.images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Show image ${index + 1} of ${product.name}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <img src={image} alt="" width="86" height="57" />
          </button>
        ))}
      </div>
    </div>
  )
}
