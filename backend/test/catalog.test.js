import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { products } from '../data/products.js'
import { createApp } from '../src/app.js'
import { parseCatalogQuery } from '../src/catalogQuery.js'

test('validates scalar catalog input and treats search as literal text', () => {
  const { filter, sort, page, limit } = parseCatalogQuery({
    q: 'mouse.*', min: '100', max: '1600', sort: 'price-asc', page: '2', limit: '5',
  })
  assert.deepEqual(filter.price, { $gte: 100, $lte: 1600 })
  assert.equal(filter.$or[0].name.test('mouse123'), false)
  assert.equal(filter.$or[0].name.test('MOUSE.*'), true)
  assert.deepEqual(sort, { price: 1, id: 1 })
  assert.equal(page, 2)
  assert.equal(limit, 5)

  for (const query of [
    { q: ['mouse', 'headset'] }, { limit: '101' }, { page: '0' }, { sort: '__proto__' },
    { category: '!' }, { min: '1000', max: '100' }, { min: '-1' }, { ids: '01,{}' }, { other: 'x' },
  ]) {
    assert.throws(() => parseCatalogQuery(query), { status: 400 })
  }
})

test('serves health, applies security headers, exact-origin CORS and request limits', async () => {
  let connected = true
  const origin = 'https://neonbyte.example'
  const logger = { info() {}, error() {} }
  const app = createApp({ origins: [origin], ready: async () => connected, logger })
  const server = app.listen(0, '127.0.0.1')
  try {
    await once(server, 'listening')
    const base = 'http://127.0.0.1:' + server.address().port
    const health = await fetch(base + '/api/health', { headers: { Origin: origin } })
    assert.equal(health.status, 200)
    assert.deepEqual(await health.json(), { status: 'ok', database: 'connected' })
    assert.equal(health.headers.get('access-control-allow-origin'), origin)
    assert.equal(health.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(health.headers.get('cache-control'), 'no-store')
    connected = false
    assert.equal((await fetch(base + '/api/health')).status, 503)

    const rejected = await fetch(base + '/api/categories', { headers: { Origin: origin + '.invalid' } })
    assert.equal(rejected.status, 403)
    assert.equal(rejected.headers.get('access-control-allow-origin'), null)
    const preflight = await fetch(base + '/api/products', {
      method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' },
    })
    assert.equal(preflight.status, 204)
    assert.equal((await fetch(base + '/unrecognized')).status, 404)

    for (let index = 0; index < 180; index++) {
      const response = await fetch(base + '/api/categories')
      assert.equal(response.status, 200)
      assert.equal((await response.json()).data.length, 8)
    }
    assert.equal((await fetch(base + '/api/categories')).status, 429)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

const liveApi = process.env.NEONBYTE_TEST_API_URL
test('returns the seeded catalog through all endpoints against MongoDB', { skip: !liveApi }, async () => {
  async function get(path, status = 200) {
    const response = await fetch(liveApi + '/api/' + path)
    assert.equal(response.status, status, path)
    return response.json()
  }
  assert.equal((await get('health')).database, 'connected')
  assert.equal((await get('categories')).data.length, 8)

  const list = await get('products')
  assert.equal(list.total, 24)
  const expected = products.map(({ id, name, price, slug }) => ({ id, name, price, slug }))
  assert.deepEqual(list.data.map(({ id, name, price, slug }) => ({ id, name, price, slug })), expected)
  assert.ok(list.data.every((entry) => entry.categoryName && entry.specifications && entry.images.length > 0 && !entry._id))
  const paged = await get('products?limit=5&page=2')
  assert.equal(paged.totalPages, 5)
  assert.deepEqual(paged.data.map(({ id }) => id), expected.slice(5, 10).map(({ id }) => id))
  assert.equal((await get('products/featured')).data.length, 4)
  assert.equal((await get('products?q=ghost%20glide')).data[0].slug, 'ghost-glide')
  const priced = await get('products?category=monitors&min=4000&max=6000')
  assert.deepEqual(priced.data.map(({ slug }) => slug), ['horizon-27'])
  const collection = await get('products?collection=minimal')
  assert.ok(collection.data.length && collection.data.every((product) => product.collections.includes('minimal')))
  assert.equal((await get('products?sort=price-desc')).data[0].slug, 'orbit-34')
  assert.equal((await get('products?sort=newest')).data[0].slug, 'spectrum-link')
  assert.equal((await get('products?sort=rating')).data[0].slug, 'afterglow-65')
  assert.equal((await get('products?ids=01,02')).data.length, 2)

  const detail = await get('products/afterglow-65')
  assert.equal(detail.data.price, 1899)
  assert.equal(detail.related.length, 4)
  assert.ok(detail.related.every(({ id }) => id !== detail.data.id))
  await get('products/missing-slug', 404)
  await get('products?min=8000&max=200', 400)
})
