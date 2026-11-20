import { categories } from '../data/categories.js'
import { HttpError } from './httpError.js'

const sorts = {
  featured: { featured: -1, id: 1 },
  'price-asc': { price: 1, id: 1 },
  'price-desc': { price: -1, id: 1 },
  newest: { createdAt: -1, id: 1 },
  rating: { rating: -1, id: 1 },
}

const identifier = /^[a-z0-9-]{1,48}$/
const queryFields = new Set(['q', 'category', 'collection', 'min', 'max', 'sort', 'ids', 'page', 'limit'])

function text(value, label, maxLength, pattern) {
  if (value === undefined || value === '') return ''
  if (typeof value !== 'string' || value.length > maxLength || (pattern && !pattern.test(value))) {
    throw new HttpError(400, `Invalid ${label}.`)
  }
  return value.trim()
}

function number(value, label, fallback, min, max, pattern) {
  const raw = text(value, label, 12, pattern)
  if (!raw) return fallback
  const parsed = Number(raw)
  if (parsed < min || parsed > max) throw new HttpError(400, `Invalid ${label}.`)
  return parsed
}

export function parseCatalogQuery(query) {
  if (Object.keys(query).some((key) => !queryFields.has(key))) {
    throw new HttpError(400, 'Unknown catalog filter.')
  }
  const q = text(query.q, 'search', 100)
  const category = text(query.category, 'category', 48, identifier)
  const collection = text(query.collection, 'collection', 48, identifier)
  const min = number(query.min, 'minimum price', undefined, 0, 1000000, /^\d+(?:\.\d{1,2})?$/)
  const max = number(query.max, 'maximum price', undefined, 0, 1000000, /^\d+(?:\.\d{1,2})?$/)
  const page = number(query.page, 'page', 1, 1, 1000, /^\d+$/)
  const limit = number(query.limit, 'limit', 24, 1, 100, /^\d+$/)
  const rawIds = text(query.ids, 'product IDs', 4899)
  const ids = rawIds ? [...new Set(rawIds.split(','))] : []
  const sort = text(query.sort, 'sort order', 24) || 'featured'
  if (!Object.hasOwn(sorts, sort)) throw new HttpError(400, 'Invalid sort order.')
  if (ids.length > 100 || ids.some((id) => !identifier.test(id))) throw new HttpError(400, 'Invalid product IDs.')
  if (min !== undefined && max !== undefined && min > max) {
    throw new HttpError(400, 'Maximum price must be at least the minimum.')
  }

  const filter = {}
  if (category) filter.category = category
  if (collection) filter.collections = collection
  if (ids.length) filter.id = { $in: ids }
  if (min !== undefined || max !== undefined) {
    filter.price = {
      ...(min !== undefined && { $gte: min }),
      ...(max !== undefined && { $lte: max }),
    }
  }
  if (q) {
    const literal = new RegExp(q.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&'), 'i')
    const categoryMatches = categories.filter((item) => literal.test(item.name)).map((item) => item.id)
    filter.$or = [{ name: literal }, { description: literal }]
    if (categoryMatches.length) filter.$or.push({ category: { $in: categoryMatches } })
  }
  return { filter, sort: sorts[sort], page, limit }
}
