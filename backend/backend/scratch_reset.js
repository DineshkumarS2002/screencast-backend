require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to DB...')
    
    const user = await User.findOne({ username: 'Dina08' })
    if (!user) {
      console.log('User Dina08 not found!')
      process.exit(1)
    }
    
    user.password = '123456'
    await user.save()
    
    console.log('Password for Dina08 updated to: 123456')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

reset()
