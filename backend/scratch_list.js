require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    const users = await User.find({}, 'username email')
    console.log('--- ALL USERS IN DB ---')
    users.forEach(u => console.log(`- "${u.username}" (${u.email})`))
    console.log('-----------------------')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

listUsers()
