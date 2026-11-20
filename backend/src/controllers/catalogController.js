import { categories } from '../../data/categories.js'
import { parseCatalogQuery } from '../catalogQuery.js'
import { HttpError } from '../httpError.js'
import { Product } from '../models/Product.js'

const publicProducts = (filter = {}) => Product.find(filter, { _id: 0 }).lean().maxTimeMS(3000)
const categoryNames = new Map(categories.map(({ id, name }) => [id, name]))
const displayProduct = (product) => ({
  ...product,
  categoryName: categoryNames.get(product.category) || product.category,
})

export async function listProducts(req, res) {
  const { filter, sort, page, limit } = parseCatalogQuery(req.query)
  const [data, total] = await Promise.all([
    publicProducts(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
    Product.countDocuments(filter).maxTimeMS(3000).exec(),
  ])
  res.json({ data: data.map(displayProduct), page, limit, total, totalPages: Math.ceil(total / limit) })
}

export async function featuredProducts(_req, res) {
  const data = await publicProducts({ featured: true }).sort({ id: 1 }).limit(4).exec()
  res.json({ data: data.map(displayProduct) })
}

export async function productDetail(req, res) {
  const { slug } = req.params
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) throw new HttpError(400, 'Invalid product slug.')
  const [data] = await publicProducts({ slug }).limit(1).exec()
  if (!data) throw new HttpError(404, 'Product not found.')

  const related = await publicProducts({ category: data.category, id: { $ne: data.id } }).sort({ id: 1 }).limit(4).exec()
  if (related.length < 4 && data.collections?.length) {
    related.push(...await publicProducts({
      category: { $ne: data.category },
      collections: { $in: data.collections },
    }).sort({ id: 1 }).limit(4 - related.length).exec())
  }
  res.json({ data: displayProduct(data), related: related.map(displayProduct) })
}

export function listCategories(_req, res) {
  res.json({ data: categories })
}
