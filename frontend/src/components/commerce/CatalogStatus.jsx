import { CloudOff } from 'lucide-react'
import Button from '../button/button'
import { EmptyState } from './Layout'

export default function CatalogStatus({ query, label = 'Loading catalog…' }) {
  if (query.isError) {
    return (
      <EmptyState icon={CloudOff} title="Catalog unavailable" description={query.error.message}>
        <Button variant="outline" onClick={() => query.refetch()}>Try again</Button>
      </EmptyState>
    )
  }
  return <p className="catalog-loading" role="status">{label}</p>
}
