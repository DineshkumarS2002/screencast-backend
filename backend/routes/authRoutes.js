const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

/**
 * Senior Full-Stack Implementation of Auth Routes
 * Includes: Robust validation, error logging, and standard HTTP status codes.
 */

// Helper to generate JWT tokens
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in environment variables')
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // 1. Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields (username, email, password) are required.' })
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] })
    if (userExists) {
      const field = userExists.email === email ? 'Email' : 'Username'
      return res.status(400).json({ message: `${field} is already registered.` })
    }

    // 3. Create user (password is hashed in User model pre-save hook)
    const user = await User.create({ username, email, password })

    if (user) {
      res.status(201).json({
        user: user.toSafeObject(),
        token: generateToken(user._id),
        message: 'Account created successfully!'
      })
    }
  } catch (error) {
    console.error('[AUTH_REGISTER_ERROR]:', error)
    res.status(500).json({ 
      message: 'Failed to create account. This is usually a database connection or config issue.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' })
    }

    // Find user and include password field
    const user = await User.findOne({ username }).select('+password')
    
    if (user && (await user.comparePassword(password))) {
      res.json({
        user: user.toSafeObject(),
        token: generateToken(user._id),
        message: 'Welcome back!'
      })
    } else {
      res.status(401).json({ message: 'Invalid credentials. Please check your username and password.' })
    }
  } catch (error) {
    console.error('[AUTH_LOGIN_ERROR]:', error)
    res.status(500).json({ 
      message: 'Server error during login. Please check backend logs.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' })
  }
})

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

module.exports = router
