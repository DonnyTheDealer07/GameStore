import { Heart } from 'lucide-react'
import { EmptyState, PageHeader, ShopButton } from '../../components/commerce/Layout'
import CatalogStatus from '../../components/commerce/CatalogStatus'
import ProductGrid from '../../components/commerce/ProductGrid'
import { useCommerce } from '../../store/commerce'

export default function Wishlist() {
  const { wishlistProducts, removeFromWishlist, savedQuery, hasUnresolvedWishlist } = useCommerce()
  return (
    <main className="store-page" id="main-content" tabIndex={-1}>
      <PageHeader title="Your wishlist" description="Keep track of the gear you’d like to add to your setup." />
      <div className="store-shell store-section">
        {hasUnresolvedWishlist ? <CatalogStatus query={savedQuery} label="Loading your wishlist…" /> : wishlistProducts.length ? (
          <ProductGrid products={wishlistProducts} onMove={removeFromWishlist} />
        ) : (
          <EmptyState icon={Heart} title="Save something for later" description="Use the heart on any product to keep it here.">
            <ShopButton />
          </EmptyState>
        )}
      </div>
    </main>
  )
}
