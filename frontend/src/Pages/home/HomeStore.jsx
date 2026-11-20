import Button from '../../components/button/button'
import { CategoryCard, PriceDisplay, SectionHeading } from '../../components/commerce/Layout'
import ProductGrid from '../../components/commerce/ProductGrid'
import CatalogStatus from '../../components/commerce/CatalogStatus'
import useReveal from '../../components/commerce/useReveal'
import { useCategories, useFeaturedProducts } from '../../api/catalog'
import { mediaUrl } from '../../api/media'

export default function HomeStore() {
  const featured = useFeaturedProducts()
  const categories = useCategories()
  const content = useReveal(`${Boolean(featured.data)}:${Boolean(categories.data)}`)
  const spotlight = featured.data?.find((product) => product.slug === 'afterglow-65') || featured.data?.[0]
  const isAfterglow = spotlight?.slug === 'afterglow-65'

  return (
    <div className="home-store" ref={content}>
      <section className="store-shell store-section" aria-labelledby="home-featured">
        <SectionHeading title="Worth the upgrade" id="home-featured" action={<Button to="/shop" variant="outline">View all products</Button>} />
        <div data-reveal>
          {featured.isPending || featured.isError
            ? <CatalogStatus query={featured} label="Loading featured products…" />
            : <ProductGrid products={featured.data} />}
        </div>
      </section>
      <section className="store-shell store-section store-section--compact" aria-labelledby="home-categories">
        <SectionHeading title="Explore the gear" id="home-categories" />
        {categories.isPending || categories.isError ? <CatalogStatus query={categories} label="Loading categories…" /> : (
          <div className="category-grid" data-reveal>
            {categories.data.map((category) => <CategoryCard key={category.id} category={category} />)}
          </div>
        )}
      </section>
      {spotlight && <section className="store-shell store-section store-section--compact" aria-labelledby="spotlight-heading">
        <div className="spotlight" data-reveal>
          <img
            src={isAfterglow ? mediaUrl('/editorial/spotlight.webp') : spotlight.detailImages?.[0] || spotlight.images[0]}
            srcSet={isAfterglow ? `${mediaUrl('/editorial/spotlight-640.webp')} 640w, ${mediaUrl('/editorial/spotlight.webp')} 1280w` : undefined}
            sizes="(max-width: 690px) 95vw, min(54vw, 790px)"
            alt={spotlight.name}
            width="1280"
            height="854"
            loading="lazy"
            decoding="async"
          />
          <div className="spotlight__copy">
            <p className="store-kicker">{spotlight.name}</p>
            <h2 id="spotlight-heading">Meet your next upgrade<span>.</span></h2>
            <p>{spotlight.description}</p>
            <dl>{Object.entries(spotlight.specifications).slice(0, 3).map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}</dl>
            <div className="spotlight__action">
              <PriceDisplay amount={spotlight.price} />
              <Button to={`/product/${spotlight.slug}`}>Shop now</Button>
            </div>
          </div>
        </div>
      </section>}
    </div>
  )
}
