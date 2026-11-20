import { Heart, ShoppingBag, Truck } from 'lucide-react'
import Button from '../../components/button/button'
import CartItem from '../../components/commerce/CartItem'
import CatalogStatus from '../../components/commerce/CatalogStatus'
import { EmptyState, OrderSummary, PageHeader, ShopButton } from '../../components/commerce/Layout'
import { getTotals, useCommerce } from '../../store/commerce'

export default function Cart() {
  const { lines, cartCount, savedQuery, hasUnresolvedCart } = useCommerce()

  return (
    <main className="store-page" id="main-content" tabIndex={-1}>
      <PageHeader title="Your cart" description={`${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your demo cart.`}>
        <Button to="/wishlist" variant="outline" size="small" className="page-header__action"><Heart size={15} aria-hidden="true" /> Wishlist</Button>
      </PageHeader>
      <div className="store-shell store-section">
        {hasUnresolvedCart ? <CatalogStatus query={savedQuery} label="Loading your cart…" /> : lines.length ? (
          <div className="order-layout">
            <div>
              <ul className="cart-list">{lines.map((line) => <CartItem key={line.key} line={line} />)}</ul>
              <Button to="/shop" className="continue-shopping" variant="outline" size="small">Continue shopping</Button>
            </div>
            <OrderSummary totals={getTotals(lines)}>
              <Button to="/checkout">Proceed to checkout</Button>
              <p className="order-summary__hint"><Truck size={17} aria-hidden="true" /> Free standard demo shipping from R2,500.</p>
            </OrderSummary>
          </div>
        ) : (
          <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Explore the shop to find gear for your setup.">
            <ShopButton>Continue shopping</ShopButton>
          </EmptyState>
        )}
      </div>
    </main>
  )
}
