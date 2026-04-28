const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Video = require('../models/Video')
const { protect } = require('../middleware/auth')

// Ensure uploads directory exists
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
})

// @route   POST /api/upload
router.post('/upload', protect, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No video file provided' })
    }

    const { title, duration, mime_type } = req.body
    const videoFile = req.files.file[0]
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null

    // Senior approach: store relative paths to avoid http/https protocol issues
    const file_url = `/uploads/${videoFile.filename}`
    let thumbnail_url = null
    if (thumbnailFile) {
      thumbnail_url = `/uploads/${thumbnailFile.filename}`
    }

    // Save to MongoDB
    const video = await Video.create({
      user: req.user._id,
      title: title || 'Untitled Recording',
      file_url,
      thumbnail_url,
      duration: duration || 0,
      file_size: videoFile.size,
      mime_type: mime_type || videoFile.mimetype
    })

    res.status(201).json({
      message: 'Video uploaded successfully!',
      video: {
        id: video._id,
        title: video.title,
        file_url: video.file_url,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        created_at: video.createdAt
      }
    })

  } catch (error) {
    console.error('Upload Error:', error)
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
})

// @route   GET /api/videos
router.get('/videos', protect, async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({
      results: videos.map(v => ({
        id: v._id,
        title: v.title,
        file_url: v.file_url,
        thumbnail_url: v.thumbnail_url,
        duration: v.duration,
        created_at: v.createdAt
      })),
      count: videos.length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/videos/:id
router.delete('/videos/:id', protect, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, user: req.user._id })
    if (!video) return res.status(404).json({ message: 'Recording not found' })
    
    // Delete local file
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(video.file_url))
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    
    await video.deleteOne()
    res.json({ message: 'Recording deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
