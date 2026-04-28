require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

// Initialize DB
connectDB()

const app = express()

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow:  local dev (localhost:5173 / localhost:3000)
//         Netlify production (set FRONTEND_URL in Render env vars)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,          // e.g. https://your-app.netlify.app
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl / Postman (no origin header)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'ScreenCast Node.js API' })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api',      require('./routes/videoRoutes'))

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
