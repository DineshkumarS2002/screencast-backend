const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// Helper to generate JWT tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const userExists = await User.findOne({ $or: [{ email }, { username }] })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({ username, email, password })

    if (user) {
      res.status(201).json({
        user: user.toSafeObject(),
        token: generateToken(user._id),
        message: 'Account created successfully!'
      })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
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
        token: generateToken(user._id),
        message: 'Welcome back!'
      })
    } else {
      res.status(401).json({ message: 'Invalid username or password' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email
  })
})

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

module.exports = router
