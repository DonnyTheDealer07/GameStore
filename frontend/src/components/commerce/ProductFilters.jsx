import { useEffect, useId, useRef, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Button from '../button/button'

export function SearchInput({ value, onChange }) {
  return (
    <div className="store-search" role="search">
      <Search size={20} aria-hidden="true" />
      <input type="search" aria-label="Search products" placeholder="Search products" value={value} onChange={(event) => onChange(event.target.value)} />
      {value && <button type="button" aria-label="Clear search" onClick={() => onChange('')}><X size={18} aria-hidden="true" /></button>}
    </div>
  )
}

function FilterFields({ filters, onChange, categoryQuery }) {
  const radioGroup = useId()
  const categories = categoryQuery.data || []
  return (
    <div className="product-filter-fields">
      <fieldset>
        <legend>Category</legend>
        {categoryQuery.isPending && <p className="filter-message" role="status">Loading categories…</p>}
        {categoryQuery.isError && <button type="button" className="store-text-button" onClick={() => categoryQuery.refetch()}>Retry categories</button>}
        {[{ id: '', name: 'All categories' }, ...categories].map((category) => (
          <label className="filter-option" key={category.id}>
            <input type="radio" name={radioGroup} checked={filters.category === category.id} onChange={() => onChange('category', category.id)} />
            {category.name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Price range <span>(ZAR)</span></legend>
        <div className="filter-range">
          <label>Min<input type="number" min="0" inputMode="numeric" value={filters.min} onChange={(event) => onChange('min', event.target.value)} placeholder="0" /></label>
          <label>Max<input type="number" min="0" inputMode="numeric" value={filters.max} onChange={(event) => onChange('max', event.target.value)} placeholder="Any" /></label>
        </div>
        {filters.min !== '' && filters.max !== '' && Number(filters.min) > Number(filters.max) && (
          <p className="field-error">Maximum must be at least the minimum.</p>
        )}
      </fieldset>
    </div>
  )
}

export default function ProductFilters({ filters, onChange, onClear, active, categoryQuery }) {
  return (
    <aside className="product-filters" aria-label="Product filters">
      <div className="product-filters__heading">
        <h2><SlidersHorizontal size={18} aria-hidden="true" /> Filters</h2>
        <button className="store-text-button" type="button" onClick={onClear} disabled={!active}>Clear all</button>
      </div>
      <FilterFields filters={filters} onChange={onChange} categoryQuery={categoryQuery} />
    </aside>
  )
}

export function MobileProductFilters({ filters, onChange, onClear, active, resultLabel, categoryQuery }) {
  const dialog = useRef(null)
  const dialogId = useId()
  const titleId = useId()
  const [expanded, setExpanded] = useState(false)
  const count = [filters.category, filters.min, filters.max].filter(Boolean).length

  useEffect(() => {
    const panel = dialog.current
    const mobile = window.matchMedia('(max-width: 690px)')
    const handleResize = (event) => {
      if (!event.matches && panel.open) panel.close()
    }
    mobile.addEventListener('change', handleResize)
    return () => mobile.removeEventListener('change', handleResize)
  }, [])

  function openDrawer() {
    dialog.current.showModal()
    setExpanded(true)
  }

  function closeDrawer() {
    dialog.current.close()
    setExpanded(false)
  }

  return (
    <div className="product-filters__mobile">
      <Button
        variant="outline"
        size="small"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={expanded}
        onClick={openDrawer}
      >
        <SlidersHorizontal size={17} aria-hidden="true" /> Filters{count > 0 && ` (${count})`}
      </Button>
      <dialog
        className="filter-drawer"
        id={dialogId}
        ref={dialog}
        aria-labelledby={titleId}
        onClose={() => setExpanded(false)}
        onCancel={(event) => {
          event.preventDefault()
          closeDrawer()
        }}
        onClick={(event) => { if (event.target === event.currentTarget) closeDrawer() }}
      >
        <div className="filter-drawer__layout">
          <header className="filter-drawer__header">
            <h2 id={titleId}>Filters</h2>
            <button className="store-icon-button" type="button" aria-label="Close filters" onClick={closeDrawer}>
              <X size={20} aria-hidden="true" />
            </button>
          </header>
          <div className="filter-drawer__body">
            <FilterFields filters={filters} onChange={onChange} categoryQuery={categoryQuery} />
          </div>
          <footer className="filter-drawer__actions">
            <button className="store-text-button" type="button" onClick={onClear} disabled={!active}>Clear all</button>
            <Button onClick={closeDrawer}>{resultLabel ? `Show ${resultLabel}` : 'View results'}</Button>
          </footer>
        </div>
      </dialog>
    </div>
  )
}
