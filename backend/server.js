require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const connectDB = require('./config/db')

const app = express()

// ─── Database Connection ──────────────────────────────────────────────────────
connectDB()

// ─── Ensure Uploads Directory ─────────────────────────────────────────────────
const uploadPath = path.resolve(__dirname, 'uploads')
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
  console.log('📁 Created uploads directory at:', uploadPath)
} else {
  console.log('✅ Found uploads directory at:', uploadPath)
}

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
    return callback(null, true) // Lenient for production troubleshooting
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Absolute Static Serving ──────────────────────────────────────────────────
// This handles https://.../uploads/file.webm
app.use('/uploads', express.static(uploadPath))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api', require('./routes/videoRoutes'))

app.get('/', (req, res) => res.json({ status: 'online', uploads_path: uploadPath }))

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📂 Serving static files from: ${uploadPath}`)
})
