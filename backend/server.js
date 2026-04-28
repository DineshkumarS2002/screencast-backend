require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')

const app = express()

// ─── Database Connection ──────────────────────────────────────────────────────
connectDB()

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://screencast-screen-recorder.netlify.app'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/**
 * Senior Setup: Use absolute path for static files.
 * This ensures files are served correctly even in cloud environments (Render/Railway).
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api', require('./routes/videoRoutes'))

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'ScreenCast Pro API',
    version: '1.0.0'
  })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
