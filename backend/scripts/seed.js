import { products } from '../data/products.js'
import { closeDatabase, connectDatabase } from '../src/database.js'
import { errorKind } from '../src/httpError.js'
import { Product } from '../src/models/Product.js'

async function seed() {
  if (!process.argv.includes('--apply')) {
    console.error('Run npm run seed -- --apply to insert the initial catalog.')
    process.exitCode = 1
    return
  }

  await connectDatabase()
  const records = products.map((product) => new Product(product))
  await Promise.all(records.map((product) => product.validate()))

  const byId = new Map(products.map(({ id, slug }) => [id, slug]))
  const stored = await Product.find({}, { id: 1, slug: 1 }).limit(products.length + 1).lean()
  if (stored.some(({ id, slug }) => byId.get(id) !== slug) || stored.length > products.length) {
    console.error('The target collection contains an existing catalog with different product identities.')
    process.exitCode = 1
    return
  }

  await Product.createIndexes()
  const result = await Product.bulkWrite(records.map((product) => {
    const { _id, ...insert } = product.toObject({ flattenMaps: true })
    return {
      updateOne: {
        filter: { id: product.id, slug: product.slug },
        update: { $setOnInsert: insert },
        upsert: true,
      },
    }
  }))
  console.info(`Catalog migration inserted ${result.upsertedCount} new products and preserved ${result.matchedCount} existing products.`)
}

try { await seed() }
catch (error) {
  console.error('Initial catalog migration failed.', errorKind(error))
  process.exitCode = 1
} finally { await closeDatabase() }
