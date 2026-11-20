import { keepPreviousData, QueryClient, useQuery } from '@tanstack/react-query'
import { mediaUrl } from './media'

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.status = status
  }
}

async function request(path, signal, params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null))
  const url = apiBase + '/api/' + path + (query.size ? '?' + query.toString() : '')
  let response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.any([signal, AbortSignal.timeout(75000)]),
    })
  } catch (error) {
    if (signal.aborted) throw error
    throw new ApiError('We couldn’t reach the catalog. Please try again.')
  }
  if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) {
    throw new ApiError('The catalog is temporarily unavailable. Please try again.', response.status)
  }
  try { return await response.json() }
  catch { throw new ApiError('The catalog returned an unreadable response.') }
}

function withMedia(product) {
  return {
    ...product,
    images: product.images.map(mediaUrl),
    detailImages: product.detailImages?.map(mediaUrl),
  }
}

export const catalogClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (attempt, error) => attempt < 1 && (!error.status || error.status >= 500),
    },
  },
})

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async ({ signal }) => (await request('categories', signal)).data,
    staleTime: 600_000,
  })
}

export function useProducts(filters, enabled) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async ({ signal }) => {
      const result = await request('products', signal, filters)
      return { ...result, data: result.data.map(withMedia) }
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async ({ signal }) => (await request('products/featured', signal)).data.map(withMedia),
  })
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async ({ signal }) => {
      const result = await request('products/' + encodeURIComponent(slug), signal)
      return { product: withMedia(result.data), related: result.related.map(withMedia) }
    },
  })
}

export function useSavedProducts(ids) {
  return useQuery({
    queryKey: ['saved-products', ids],
    enabled: ids.length > 0,
    queryFn: async ({ signal }) => {
      const chunks = Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => ids.slice(index * 100, (index + 1) * 100))
      const results = await Promise.all(chunks.map((chunk) => request('products', signal, { ids: chunk.join(','), limit: 100 })))
      return results.flatMap((result) => result.data.map(withMedia))
    },
  })
}
