import dotenv from 'dotenv'
dotenv.config()

import {app} from './index.js'
import {connectDB} from './config/db.js'
import redisClient from './config/redis.js'

const PORT: number = Number(process.env.PORT) || 3000

// try {
//   await redisClient.connect()
//   console.log('Redis connected')
// } catch (error) {
//   console.warn('Redis unavailable, continuing without cache')
// }

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})