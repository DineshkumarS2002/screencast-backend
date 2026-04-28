const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary').v2
const Video = require('../models/Video')
const { protect } = require('../middleware/auth')

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Ensure temporary local uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer Disk Storage (Temporary storage before Cloudinary upload)
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
  let videoLocalPath = null
  let thumbLocalPath = null

  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No video file provided' })
    }

    const videoFile = req.files.file[0]
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null
    
    videoLocalPath = videoFile.path
    if (thumbnailFile) thumbLocalPath = thumbnailFile.path

    const { title, duration, mime_type } = req.body

    // 1. Upload Video to Cloudinary
    console.log('☁️ Uploading video to Cloudinary...')
    const videoResult = await cloudinary.uploader.upload(videoLocalPath, {
      resource_type: 'video',
      folder: 'screencasts/videos'
    })

    // 2. Upload Thumbnail to Cloudinary (if exists)
    let thumbUrl = null
    if (thumbLocalPath) {
      console.log('☁️ Uploading thumbnail to Cloudinary...')
      const thumbResult = await cloudinary.uploader.upload(thumbLocalPath, {
        resource_type: 'image',
        folder: 'screencasts/thumbnails'
      })
      thumbUrl = thumbResult.secure_url
    }

    // 3. Save to MongoDB with PERMANENT Cloudinary URLs
    const video = await Video.create({
      user: req.user._id,
      title: title || 'Untitled Recording',
      file_url: videoResult.secure_url,
      thumbnail_url: thumbUrl,
      duration: duration || 0,
      file_size: videoFile.size,
      mime_type: mime_type || videoFile.mimetype
    })

    // 4. Cleanup: Delete local temporary files
    if (fs.existsSync(videoLocalPath)) fs.unlinkSync(videoLocalPath)
    if (thumbLocalPath && fs.existsSync(thumbLocalPath)) fs.unlinkSync(thumbLocalPath)

    res.status(201).json({
      message: 'Video uploaded successfully to Cloud!',
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
    // Cleanup on error
    if (videoLocalPath && fs.existsSync(videoLocalPath)) fs.unlinkSync(videoLocalPath)
    if (thumbLocalPath && fs.existsSync(thumbLocalPath)) fs.unlinkSync(thumbLocalPath)
    
    console.error('Cloudinary Upload Error:', error)
    res.status(500).json({ message: 'Cloud upload failed', error: error.message })
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
    
    // Note: In a full implementation, we would also delete the file from Cloudinary 
    // using cloudinary.uploader.destroy(public_id)
    
    await video.deleteOne()
    res.json({ message: 'Recording deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
