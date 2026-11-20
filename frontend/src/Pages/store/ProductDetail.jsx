import { useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useProduct } from '../../api/catalog'
import { PriceDisplay, SectionHeading } from '../../components/commerce/Layout'
import CatalogStatus from '../../components/commerce/CatalogStatus'
import ProductGallery from '../../components/commerce/ProductGallery'
import ProductGrid from '../../components/commerce/ProductGrid'
import { ProductPurchase, ProductRating } from '../../components/commerce/ProductPurchase'
import { NotFound } from './Brand'

export default function ProductDetail() {
  const { slug } = useParams()
  const query = useProduct(slug)
  const name = query.data?.product.name
  useEffect(() => {
    if (name) document.title = `${name} | NEONBYTE`
  }, [name, slug])

  if (query.isError && [400, 404].includes(query.error.status)) return <NotFound missingProduct />
  if (query.isPending || query.isError) return (
    <main className="store-page store-detail" id="main-content" tabIndex={-1}>
      <div className="store-shell store-section"><CatalogStatus query={query} label="Loading product…" /></div>
    </main>
  )
  const { product, related } = query.data

  return (
    <main className="store-page store-detail" id="main-content" tabIndex={-1}>
      <div className="store-shell">
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <ol>
            <li><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /></li>
            <li><Link to="/shop">Shop</Link><ChevronRight size={14} aria-hidden="true" /></li>
            <li><Link to={`/shop?category=${product.category}`}>{product.categoryName}</Link><ChevronRight size={14} aria-hidden="true" /></li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
        <div className="product-detail__hero">
          <ProductGallery key={product.id} product={product} />
          <div className="product-detail__copy">
            <div className="product-card__meta"><p>{product.categoryName}</p><ProductRating rating={product.rating} /></div>
            <h1>{product.name}<span aria-hidden="true">.</span></h1>
            <PriceDisplay amount={product.price} />
            <p>{product.description}</p>
            <ProductPurchase key={product.id} product={product} />
            <section className="product-specs" aria-labelledby="specs-heading">
              <h2 id="specs-heading">Specifications</h2>
              <dl>{Object.entries(product.specifications).map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}</dl>
            </section>
          </div>
        </div>
      </div>
      {!!related.length && <section className="store-shell store-section" aria-labelledby="related-heading">
        <SectionHeading id="related-heading" title="Related products" />
        <ProductGrid products={related} />
      </section>}
    </main>
  )
}
