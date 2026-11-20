import { createApp } from './app.js'
import { closeDatabase, connectDatabase } from './database.js'
import { errorKind } from './httpError.js'

async function start() {
  const port = Number(process.env.PORT || 5000)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT is invalid.')
  const app = createApp()
  await connectDatabase()

  const server = app.listen(port, '0.0.0.0', () => {
    console.info(`NEONBYTE API listening on port ${port}. MongoDB connected.`)
  })

  async function shutdown(exitCode = 0) {
    const force = setTimeout(() => {
      server.closeAllConnections()
      process.exit(1)
    }, 10_000)
    force.unref()
    server.close(async () => {
      try { await closeDatabase() }
      catch { exitCode = 1 }
      clearTimeout(force)
      process.exitCode = exitCode
    })
  }

  server.on('error', (error) => {
    console.error('HTTP server failed.', errorKind(error))
    void shutdown(1)
  })
  process.once('SIGTERM', () => void shutdown())
  process.once('SIGINT', () => void shutdown())
}

start().catch(async (error) => {
  console.error('API startup failed. Check backend configuration and database access.', errorKind(error))
  try { await closeDatabase() } finally { process.exitCode = 1 }
})
