import { useState } from 'react'
import { Check, FlaskConical, ShoppingBag } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/button/button'
import CatalogStatus from '../../components/commerce/CatalogStatus'
import { EmptyState, OrderSummary, PageHeader, PriceDisplay, ShopButton } from '../../components/commerce/Layout'
import { getTotals, orderStorageKey, readStorage, shippingMethods, useCommerce, writeStorage } from '../../store/commerce'

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
]

function CheckoutField({ name, label, error, optional = false, children, ...input }) {
  const fieldProps = {
    id: `checkout-${name}`,
    name,
    required: !optional,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `checkout-error-${name}` : undefined,
  }
  return (
    <div className="checkout-field">
      <label htmlFor={fieldProps.id}>{label}{optional && <span> (optional)</span>}</label>
      {children ? <select {...fieldProps} defaultValue="">{children}</select> : <input {...fieldProps} {...input} />}
      {error && <p className="field-error" id={fieldProps['aria-describedby']}>{error}</p>}
    </div>
  )
}

function validate(form) {
  const values = new FormData(form)
  const value = (name) => String(values.get(name) ?? '').trim()
  const errors = {}
  if (!value('firstName')) errors.firstName = 'Enter a first name.'
  if (!value('lastName')) errors.lastName = 'Enter a last name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) errors.email = 'Enter a valid email address.'
  if (!/^\+?\d{8,15}$/.test(value('phone').replace(/[\s().-]/g, ''))) errors.phone = 'Enter a valid phone number.'
  if (!value('address')) errors.address = 'Enter a street address.'
  if (!value('city')) errors.city = 'Enter a town or city.'
  if (!provinces.includes(value('province'))) errors.province = 'Choose a province.'
  if (!/^\d{4}$/.test(value('postal'))) errors.postal = 'Enter a four-digit postal code.'
  return errors
}

export default function Checkout() {
  const { lines, cartCount, clearCart, savedQuery, hasUnresolvedCart } = useCommerce()
  const [method, setMethod] = useState(shippingMethods[0].id)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const totals = getTotals(lines, method)

  function placeOrder(event) {
    event.preventDefault()
    const form = event.currentTarget
    const nextErrors = validate(form)
    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      form.elements.namedItem(firstError)?.focus()
      return
    }
    if (!lines.length) return

    const randomId = window.crypto.getRandomValues(new Uint32Array(1))[0]
    const order = {
      reference: `NB-${randomId.toString(16).padStart(8, '0').toUpperCase()}`,
      totals,
      cartCount,
      method,
    }
    writeStorage('sessionStorage', orderStorageKey, order)
    clearCart()
    navigate('/checkout/confirmation', { replace: true, state: { order } })
  }

  return (
    <main className="store-page" id="main-content" tabIndex={-1}>
      <PageHeader title="Checkout" eyebrow="Demo checkout" description="Use sample contact and shipping details to place a simulated order." />
      <div className="store-shell store-section">
        {hasUnresolvedCart ? <CatalogStatus query={savedQuery} label="Loading your cart…" /> : lines.length ? (
          <form className="order-layout" noValidate onSubmit={placeOrder}>
            <div className="checkout-form">
              {Object.keys(errors).length > 0 && <p className="field-error" role="alert">Review the highlighted fields before placing your demo order.</p>}
              <section className="checkout-panel" aria-labelledby="contact-heading">
                <h2 id="contact-heading">Contact information</h2>
                <div className="checkout-grid">
                  <CheckoutField name="firstName" label="First name" autoComplete="given-name" error={errors.firstName} />
                  <CheckoutField name="lastName" label="Last name" autoComplete="family-name" error={errors.lastName} />
                  <CheckoutField name="email" label="Email address" type="email" autoComplete="email" error={errors.email} />
                  <CheckoutField name="phone" label="Phone number" type="tel" autoComplete="tel" error={errors.phone} />
                </div>
              </section>
              <section className="checkout-panel" aria-labelledby="shipping-heading">
                <h2 id="shipping-heading">Shipping address</h2>
                <div className="checkout-grid">
                  <CheckoutField name="address" label="Street address" autoComplete="address-line1" error={errors.address} />
                  <CheckoutField name="address2" label="Apartment or unit" autoComplete="address-line2" optional />
                  <CheckoutField name="city" label="Town or city" autoComplete="address-level2" error={errors.city} />
                  <CheckoutField name="province" label="Province" error={errors.province}>
                    <option value="">Select a province</option>
                    {provinces.map((province) => <option key={province}>{province}</option>)}
                  </CheckoutField>
                  <CheckoutField name="postal" label="Postal code" autoComplete="postal-code" inputMode="numeric" maxLength="4" error={errors.postal} />
                  <div className="checkout-field"><label htmlFor="checkout-country">Country</label><input id="checkout-country" value="South Africa" readOnly /></div>
                </div>
              </section>
              <fieldset className="checkout-panel shipping-options">
                <legend>Shipping method</legend>
                {shippingMethods.map((option) => (
                  <label className="shipping-option" key={option.id}>
                    <input type="radio" name="shipping" checked={method === option.id} onChange={() => setMethod(option.id)} />
                    <span><strong>{option.name}</strong><small>{option.description}</small></span>
                    {getTotals(lines, option.id).shipping
                      ? <PriceDisplay amount={option.price} />
                      : <span>Free</span>}
                  </label>
                ))}
              </fieldset>
            </div>
            <OrderSummary totals={totals} shippingLabel="Shipping">
              <ul className="checkout-items">{lines.map((line) => (
                <li key={line.key}><span>{line.quantity} × {line.product.name}{line.variant ? ` · ${line.variant}` : ''}</span><PriceDisplay amount={line.quantity * line.product.price} /></li>
              ))}</ul>
              <Button type="submit">Place demo order</Button>
              <p className="order-summary__hint"><FlaskConical size={17} aria-hidden="true" /> Simulation only. No payment or delivery.</p>
            </OrderSummary>
          </form>
        ) : (
          <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add a product before starting demo checkout."><ShopButton /></EmptyState>
        )}
      </div>
    </main>
  )
}

export function Confirmation() {
  const { state } = useLocation()
  const [savedOrder] = useState(() => readStorage('sessionStorage', orderStorageKey, null))
  const order = state?.order ?? savedOrder
  const details = shippingMethods.find((method) => method.id === order?.method)
  const valid = details && /^NB-[A-F0-9]{8}$/.test(order.reference) && Number.isSafeInteger(order.cartCount)
    && ['subtotal', 'shipping', 'total'].every((key) => Number.isFinite(order.totals?.[key]))

  return (
    <main id="main-content" tabIndex={-1} className="store-page">
      <PageHeader title={valid ? 'Demo order confirmed' : 'No demo order found'} eyebrow="Demo checkout" description={valid ? 'Your checkout simulation is complete.' : 'You can place a simulated order from checkout.'} />
      <div className="store-shell store-section confirmation">
        {valid ? (
          <OrderSummary totals={order.totals} shippingLabel={details.name}>
            <p className="confirmation__reference"><Check aria-hidden="true" size={20} /> {order.reference}</p>
            <p>{order.cartCount} {order.cartCount === 1 ? 'item' : 'items'} in this simulated order.</p>
            <Button to="/shop">Continue shopping</Button>
          </OrderSummary>
        ) : <Button to="/checkout">Go to checkout</Button>}
      </div>
    </main>
  )
}
