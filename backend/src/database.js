import mongoose from 'mongoose'

mongoose.set('bufferCommands', false)
mongoose.set('autoCreate', false)
mongoose.set('autoIndex', false)

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB || 'neonbyte'
  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('Configure MONGODB_URI in the backend environment.')
  }
  if (!/^[a-z][a-z0-9_-]{0,62}$/i.test(dbName)) {
    throw new Error('Configure a valid MONGODB_DB name.')
  }
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000, maxPoolSize: 10 })
}

export async function databaseIsReady() {
  if (mongoose.connection.readyState !== 1) return false
  try {
    await mongoose.connection.db.command({ ping: 1 }, { timeoutMS: 2500 })
    return true
  } catch {
    return false
  }
}

export const closeDatabase = () => mongoose.disconnect()
