import {createClient} from 'redis'
import type {RedisClientType} from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const redisClient: RedisClientType = createClient({
  url: redisUrl,
  socket: {
    // Redis is optional for this app; avoid infinite retry noise when it's down.
    reconnectStrategy: () => false,
    connectTimeout: 2000,
  },
}) as RedisClientType

let redisErrorLogged = false

redisClient.on('error', (err: Error) => {
  if (redisErrorLogged) return
  redisErrorLogged = true
  console.warn(`Redis unavailable (${redisUrl}). Continuing without cache.`, err.message)
})

export default redisClient