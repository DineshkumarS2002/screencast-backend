const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { OAuth2Client } = require('google-auth-library')
const axios = require('axios')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in environment variables')
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' })
    }
    const userExists = await User.findOne({ $or: [{ email }, { username }] })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' })
    }
    const user = await User.create({ username, email, password })
    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username }).select('+password')
    if (user && (await user.comparePassword(password))) {
      res.json({
        user: user.toSafeObject(),
        token: generateToken(user._id)
      })
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/google-token (Implicit Flow / Access Token)
router.post('/google-token', async (req, res) => {
  try {
    const { access_token } = req.body
    if (!access_token) return res.status(400).json({ message: 'Token required' })

    const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    const { sub: googleId, email, name, picture } = googleRes.data
    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId
        await user.save()
      }
    } else {
      const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      user = await User.create({
        username: `${baseUsername}${Date.now()}`,
        email,
        googleId,
        profilePic: picture
      })
    }

    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id)
    })
  } catch (error) {
    console.error(error)
    res.status(401).json({ message: 'Google auth failed' })
  }
})

// @route   POST /api/auth/google (ID Token flow)
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body
    const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
    const data = googleRes.data

    if (!data.email) return res.status(401).json({ message: 'Invalid token' })

    const { sub: googleId, email, name, picture } = data
    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (!user) {
      user = await User.create({
        username: `user${Date.now()}`,
        email,
        googleId,
        profilePic: picture
      })
    }

    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(401).json({ message: 'Google auth failed' })
  }
})

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      user: req.user.toSafeObject(),
      message: 'Profile fetched'
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' })
  }
})

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' })
})

module.exports = router
