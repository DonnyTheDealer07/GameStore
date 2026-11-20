import { useEffect, useState } from 'react'
import { useSavedProducts } from '../api/catalog'
import {
  addLine, CommerceContext, normalizeCart, remainingStock, restoreCart, restoreWishlist, writeStorage,
} from './commerce'

export default function CommerceProvider({ children }) {
  const [cart, setCart] = useState(restoreCart)
  const [wishlist, setWishlist] = useState(restoreWishlist)
  const [notice, setNotice] = useState(null)
  const [known, setKnown] = useState({})
  const [savedIds] = useState(() => [...new Set([...cart.map(({ id }) => id), ...wishlist])].sort())
  const savedQuery = useSavedProducts(savedIds)
  const products = new Map((savedQuery.data || []).map((product) => [product.id, product]))
  for (const product of Object.values(known)) products.set(product.id, product)

  const validCart = normalizeCart(cart, products)

  useEffect(() => {
    writeStorage('localStorage', 'neonbyte.cart.v1', cart)
  }, [cart])

  useEffect(() => {
    writeStorage('localStorage', 'neonbyte.wishlist.v1', wishlist)
  }, [wishlist])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function addToCart(product, quantity = 1, variant = product.variants?.[0] ?? null) {
    const line = { quantity, variant }
    if (addLine(cart, product, line) === cart) return false
    setKnown((current) => ({ ...current, [product.id]: product }))
    setCart((current) => addLine(current, product, line))
    setNotice({ message: `${product.name} added to cart.` })
    return true
  }

  function toggleWishlist(product) {
    setKnown((current) => ({ ...current, [product.id]: product }))
    setWishlist((current) => current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id])
  }

  function setQuantity(key, quantity) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return
    setCart((current) => {
      const normalized = normalizeCart(current, products)
      const line = normalized.find((entry) => entry.key === key)
      if (!line) return current
      const available = line.quantity + remainingStock(normalized, products.get(line.id))
      return current.map((entry) => entry.key === key ? { ...entry, quantity: Math.min(quantity, available) } : entry)
    })
  }

  const value = {
    lines: validCart.map((line) => ({ ...line, product: products.get(line.id) })),
    cartCount: validCart.reduce((total, line) => total + line.quantity, 0),
    wishlist,
    wishlistProducts: wishlist.map((id) => products.get(id)).filter(Boolean),
    savedQuery,
    hasUnresolvedCart: cart.some(({ id }) => !products.has(id)) && (savedQuery.isPending || savedQuery.isError),
    hasUnresolvedWishlist: wishlist.some((id) => !products.has(id)) && (savedQuery.isPending || savedQuery.isError),
    addToCart,
    toggleWishlist,
    removeFromWishlist: (id) => setWishlist((current) => current.filter((savedId) => savedId !== id)),
    available: (product) => Math.max(0, remainingStock(cart, product)),
    setQuantity,
    removeLine: (key) => setCart((current) => current.filter((line) => line.key !== key)),
    clearCart: () => setCart([]),
    notice,
  }

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
}
