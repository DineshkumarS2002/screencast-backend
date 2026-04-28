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
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl / Postman (no origin header)
    if (!origin) return callback(null, true)
    
    // Check if origin matches localhost or the FRONTEND_URL
    const frontend = process.env.FRONTEND_URL
    if (
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      (frontend && origin === frontend) ||
      (frontend && origin === frontend.replace(/\/$/, '')) // handle trailing slash
    ) {
      return callback(null, true)
    }
    
    console.warn(`⚠️ CORS blocked for origin: ${origin}. Allowed FRONTEND_URL: ${frontend}`)
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
