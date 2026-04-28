require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

// ─── Database Connection ──────────────────────────────────────────────────────
connectDB()

// ─── Middleware ───────────────────────────────────────────────────────────────
// Senior setup: Explicitly allow production domain and localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://screencast-screen-recorder.netlify.app'
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, etc)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static uploads
app.use('/uploads', express.static('uploads'))

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
  console.log(`🚀 Senior Backend running on port ${PORT}`)
})
