import { Link } from 'react-router-dom'
import { collections } from '../../data/catalog'
import { useCategories } from '../../api/catalog'
import SetupCard from '../../components/setup-card/SetupCard'
import { CategoryCard, SectionHeading } from '../../components/commerce/Layout'
import PageHero from '../../components/commerce/PageHero'
import CatalogStatus from '../../components/commerce/CatalogStatus'

export default function Collections() {
  const query = useCategories()
  const categories = query.data || []
  return (
    <main className="store-page" id="main-content" tabIndex={-1}>
      <PageHero title="Find your setup" eyebrow="Explore collections" description="From clean minimal spaces to full RGB battlestations. Find your style." />
      {!!categories.length && <nav className="store-shell collection-nav" aria-label="Shop by category">
        {categories.map((category) => <Link key={category.id} className="store-tag" to={`/shop?category=${category.id}`}>{category.name}</Link>)}
      </nav>}
      <section className="store-shell store-section" aria-labelledby="featured-collections">
        <SectionHeading title="Featured setups" id="featured-collections" />
        <div className="collection-grid">
          {collections.map((collection) => <SetupCard key={collection.id} title={collection.name} subtitle={collection.copy} image={collection.image} accent={collection.accent} to={`/shop?collection=${collection.id}`} />)}
        </div>
      </section>
      <section className="store-shell store-section store-section--compact" aria-labelledby="collection-categories">
        <SectionHeading title="Explore the gear" id="collection-categories" />
        {query.isPending || query.isError ? <CatalogStatus query={query} label="Loading categories…" /> : <div className="category-grid">
          {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>}
      </section>
    </main>
  )
}
