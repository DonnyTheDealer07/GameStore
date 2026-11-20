import { Router } from 'express'
import { featuredProducts, listCategories, listProducts, productDetail } from '../controllers/catalogController.js'

export const catalog = Router()
catalog.get('/products/featured', featuredProducts)
catalog.get('/products', listProducts)
catalog.get('/products/:slug', productDetail)
catalog.get('/categories', listCategories)
