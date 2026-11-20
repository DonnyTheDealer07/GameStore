import { useEffect, useState } from 'react'
import { Heart, SearchX, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/button/button'
import { EmptyState } from '../../components/commerce/Layout'
import PageHero from '../../components/commerce/PageHero'
import ProductFilters, { MobileProductFilters, SearchInput } from '../../components/commerce/ProductFilters'
import ProductGrid from '../../components/commerce/ProductGrid'
import CatalogStatus from '../../components/commerce/CatalogStatus'
import { useCategories, useProducts } from '../../api/catalog'
import { getCollection } from '../../data/catalog'

function readPrice(value) {
  return value && /^\d{1,7}(?:\.\d{1,2})?$/.test(value) ? value : ''
}

function useSettledValue(value) {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timeout = window.setTimeout(() => setSettled(value), 200)
    return () => window.clearTimeout(timeout)
  }, [value])
  return settled
}

const allowedSorts = ['price-asc', 'price-desc', 'newest', 'rating']

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const categoryQuery = useCategories()
  const collection = getCollection(params.get('collection'))
  const categoryId = params.get('category') || ''
  const category = categoryQuery.data?.find(({ id }) => id === categoryId)
  const requestedSort = params.get('sort')
  const requestedPage = Number(params.get('page'))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 1000) : 1
  const filters = {
    q: (params.get('q') ?? '').slice(0, 100),
    category: /^[a-z0-9-]{1,48}$/.test(categoryId) && (!categoryQuery.data || category) ? categoryId : '',
    collection: collection?.id ?? '',
    min: readPrice(params.get('min')),
    max: readPrice(params.get('max')),
    sort: allowedSorts.includes(requestedSort) ? requestedSort : '',
  }
  const q = useSettledValue(filters.q)
  const min = useSettledValue(filters.min)
  const max = useSettledValue(filters.max)
  const invalidPrices = (filters.min && Number(filters.min) > 1000000) || (filters.max && Number(filters.max) > 1000000)
    || (filters.min !== '' && filters.max !== '' && Number(filters.min) > Number(filters.max))
  const invalidSettledRange = Number(min) > 1000000 || Number(max) > 1000000
    || (min !== '' && max !== '' && Number(min) > Number(max))
  const query = useProducts({ ...filters, q, min, max, page }, !invalidPrices && !invalidSettledRange)
  const count = query.data?.total || 0
  const updating = query.isFetching || filters.q !== q || filters.min !== min || filters.max !== max
  const resultLabel = !invalidPrices && !query.isError && !updating
    ? `${count} ${count === 1 ? 'product' : 'products'}`
    : ''

  function changeFilter(field, value) {
    const next = new URLSearchParams(params)
    if (field !== 'page') next.delete('page')
    if (value === '') next.delete(field)
    else next.set(field, value)
    setParams(next, { replace: ['q', 'min', 'max'].includes(field) })
  }

  const filterProps = {
    filters,
    categoryQuery,
    onChange: changeFilter,
    onClear: () => setParams({}),
    active: Object.values(filters).some(Boolean),
  }

  return (
    <main className="store-page" id="main-content" tabIndex={-1}>
      <PageHero title="Find your edge" eyebrow="The gear" description="Discover gaming gear built to elevate every session." />
      <div className="store-shell store-section shop-layout">
        <div className="shop-controls">
          <SearchInput value={filters.q} onChange={(value) => changeFilter('q', value)} />
          <label className="shop-sort"><span>Sort by</span>
            <select value={filters.sort} onChange={(event) => changeFilter('sort', event.target.value)}>
              <option value="">Featured first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest demo rating</option>
            </select>
          </label>
          <Button to="/wishlist" size="small" variant="outline" className="shop-wishlist"><Heart size={17} aria-hidden="true" /> Wishlist</Button>
        </div>
        <ProductFilters {...filterProps} />
        <div className="shop-results" aria-busy={!invalidPrices && updating}>
          <div className="shop-results__meta">
            <MobileProductFilters {...filterProps} resultLabel={resultLabel} />
            <p role="status">{resultLabel || (updating && !invalidPrices ? 'Updating products…' : '')}</p>
            {category && <button type="button" className="store-tag" onClick={() => changeFilter('category', '')} aria-label={`Remove ${category.name} filter`}>{category.name}<X size={14} aria-hidden="true" /></button>}
            {collection && <button type="button" className="store-tag" onClick={() => changeFilter('collection', '')} aria-label={`Remove ${collection.name} filter`}>{collection.name}<X size={14} aria-hidden="true" /></button>}
            <p className="shop-demo-note">Demo catalog · ZAR</p>
          </div>
          {invalidPrices ? (
            <EmptyState icon={SearchX} title="Check your price range" description="Enter a minimum below the maximum, with prices up to R1,000,000.">
              <Button variant="outline" onClick={() => setParams({})}>Clear all filters</Button>
            </EmptyState>
          ) : query.isPending || query.isError ? (
            <CatalogStatus query={query} label="Loading products…" />
          ) : query.data.data.length > 0 ? <ProductGrid products={query.data.data} /> : (
            <EmptyState icon={SearchX} title="No products found" description="Try another search or clear your filters to see the full catalog.">
              <Button variant="outline" onClick={() => setParams({})}>Clear all filters</Button>
            </EmptyState>
          )}
          {!invalidPrices && !query.isError && query.data?.totalPages > 1 && (
            <nav className="shop-pagination" aria-label="Product pages">
              <Button variant="outline" size="small" disabled={page === 1} onClick={() => changeFilter('page', page > 2 ? String(page - 1) : '')}>Previous</Button>
              <p>Page {page} of {query.data.totalPages}</p>
              <Button variant="outline" size="small" disabled={page >= query.data.totalPages} onClick={() => changeFilter('page', String(page + 1))}>Next</Button>
            </nav>
          )}
        </div>
      </div>
    </main>
  )
}
