import { randomUUID } from 'node:crypto'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { databaseIsReady } from './database.js'
import { HttpError, errorKind } from './httpError.js'
import { catalog } from './routes/catalog.js'

const localOrigins = ['http://localhost:5173', 'http://localhost:4173']

function allowedOrigins() {
  const values = (process.env.FRONTEND_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean)
  for (const origin of values) {
    const url = URL.parse(origin)
    if (!url || !['https:', 'http:'].includes(url.protocol) || url.origin !== origin) {
      throw new Error('FRONTEND_ORIGINS must contain exact HTTP(S) origins.')
    }
  }
  return values.length || process.env.NODE_ENV === 'production' ? values : localOrigins
}

export function createApp({ origins = allowedOrigins(), ready = databaseIsReady, logger = console } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', process.env.RENDER === 'true' ? 1 : false)
  app.use((req, res, next) => {
    const start = performance.now()
    res.locals.requestId = randomUUID()
    res.setHeader('X-Request-Id', res.locals.requestId)
    if (req.path !== '/api/health') {
      res.once('finish', () => logger.info(JSON.stringify({
        requestId: res.locals.requestId, method: req.method,
        route: req.route?.path || 'unmatched',
        status: res.statusCode, durationMs: Math.round(performance.now() - start),
      })))
    }
    next()
  })
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origins.includes(origin)) return callback(null, Boolean(origin))
      callback(new HttpError(403, 'Origin is not allowed.'))
    },
    methods: ['GET', 'HEAD', 'OPTIONS'],
  }))
  app.get('/api/health', async (_req, res) => {
    const connected = await ready()
    res.set('Cache-Control', 'no-store').status(connected ? 200 : 503).json({
      status: connected ? 'ok' : 'unavailable',
      database: connected ? 'connected' : 'unavailable',
    })
  })
  app.use('/api', rateLimit({
    windowMs: 60_000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: 'Too many requests. Try again shortly.' }),
  }), catalog)
  app.use((_req, _res, next) => next(new HttpError(404, 'Endpoint not found.')))
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error)
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message })
    if (error instanceof URIError) return res.status(400).json({ error: 'Invalid URL.' })
    logger.error(JSON.stringify({ requestId: res.locals.requestId, ...errorKind(error) }))
    const isDatabaseError = /^Mongo(?:ose)?/.test(error.name)
    return res.status(isDatabaseError ? 503 : 500).json({ error: 'Catalog service is temporarily unavailable.' })
  })
  return app
}
