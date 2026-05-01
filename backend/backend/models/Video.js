const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Recording',
    },
    file_url: {
      type: String,
      required: [true, 'Video file URL is required'],
    },
    thumbnail_url: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
    },
    file_size: {
      type: Number,
      default: 0,
    },
    mime_type: {
      type: String,
      default: 'video/webm',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Video', videoSchema)
