import { createContext, useContext } from 'react'

export const CommerceContext = createContext(null)
export const useCommerce = () => useContext(CommerceContext)

export const shippingMethods = [
  { id: 'standard', name: 'Standard delivery', description: '3–5 business days', price: 99 },
  { id: 'express', name: 'Express delivery', description: '1–2 business days', price: 169 },
]

const currency = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

export const formatPrice = (amount) => currency.format(amount)

export function getTotals(lines, methodId = 'standard') {
  const subtotal = lines.reduce((total, line) => total + line.product.price * line.quantity, 0)
  const method = shippingMethods.find((candidate) => candidate.id === methodId) ?? shippingMethods[0]
  const shipping = subtotal === 0 || (method.id === 'standard' && subtotal >= 2500) ? 0 : method.price
  return { subtotal, shipping, total: subtotal + shipping }
}

export function readStorage(storageName, key, fallback) {
  try {
    return JSON.parse(window[storageName].getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage(storageName, key, value) {
  try {
    window[storageName].setItem(key, JSON.stringify(value))
  } catch {
    // The session still works when browser storage is unavailable.
  }
}

const cartKey = (id, variant) => JSON.stringify([id, variant])
const validId = (id) => typeof id === 'string' && /^[a-z0-9-]{1,48}$/.test(id)

function validVariant(product, variant) {
  return product.variants ? product.variants.includes(variant) : variant === null
}

export function remainingStock(cart, product) {
  const inCart = cart.reduce((total, line) => (
    line.id === product.id && validVariant(product, line.variant) ? total + line.quantity : total
  ), 0)
  return product.stock - inCart
}

export function addLine(cart, product, { variant = null, quantity }) {
  if (!validVariant(product, variant) || !Number.isSafeInteger(quantity) || quantity < 1) return cart

  const added = Math.min(quantity, remainingStock(cart, product))
  if (added <= 0) return cart

  const key = cartKey(product.id, variant)
  if (cart.some((line) => line.key === key)) {
    return cart.map((line) => line.key === key ? { ...line, quantity: line.quantity + added } : line)
  }
  return [...cart, { id: product.id, variant, quantity: added, key }]
}

export function normalizeCart(cart, products) {
  return cart.reduce((normalized, line) => {
    const product = products.get(line.id)
    return product ? addLine(normalized, product, line) : normalized
  }, [])
}

export function restoreCart() {
  const stored = readStorage('localStorage', 'neonbyte.cart.v1', [])
  if (!Array.isArray(stored)) return []
  const unique = new Map()
  for (const entry of stored) {
    if (!entry || !validId(entry.id) || !Number.isSafeInteger(entry.quantity) || entry.quantity < 1) continue
    const { id, variant = null, quantity } = entry
    if (variant !== null && (typeof variant !== 'string' || !variant || variant.length > 80)) continue
    const key = cartKey(id, variant)
    const total = Math.min(quantity + (unique.get(key)?.quantity || 0), Number.MAX_SAFE_INTEGER)
    unique.set(key, { id, variant, quantity: total, key })
  }
  return [...unique.values()]
}

export function restoreWishlist() {
  const stored = readStorage('localStorage', 'neonbyte.wishlist.v1', [])
  return Array.isArray(stored) ? [...new Set(stored.filter(validId))] : []
}

export const orderStorageKey = 'neonbyte.order.v1'
