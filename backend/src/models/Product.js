import mongoose from 'mongoose'

const { Schema } = mongoose
const requiredText = { type: String, required: true, trim: true }
const productSchema = new Schema({
  id: { ...requiredText, unique: true, match: /^[a-z0-9-]{1,48}$/ },
  slug: { ...requiredText, unique: true, match: /^[a-z0-9-]{1,120}$/ },
  name: requiredText,
  category: requiredText,
  description: requiredText,
  price: { type: Number, required: true, min: 0, max: 1000000 },
  rating: { type: Number, required: true, min: 0, max: 5 },
  stock: { type: Number, required: true, min: 0, validate: Number.isInteger },
  collections: { type: [String], default: [] },
  images: { type: [String], validate: (images) => images.length > 0 },
  detailImages: { type: [String], default: undefined },
  specifications: { type: Map, of: String, required: true },
  featured: { type: Boolean, default: false },
  variants: { type: [String], default: undefined },
  badge: String,
  createdAt: { type: Date, required: true },
}, { id: false, versionKey: false })

productSchema.index({ category: 1, price: 1, id: 1 })
productSchema.index({ collections: 1 })
productSchema.index({ featured: -1, id: 1 })
productSchema.index({ createdAt: -1, id: 1 })
productSchema.index({ rating: -1, id: 1 })

export const Product = mongoose.model('Product', productSchema)
