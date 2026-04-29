require('dotenv').config()
const mongoose = require('mongoose')

async function rawCheck() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    const db = conn.connection.db
    
    const users = await db.collection('users').find({}).toArray()
    console.log('--- RAW USERS IN "users" COLLECTION ---')
    console.log('Count:', users.length)
    users.forEach(u => console.log(`- Username: "${u.username}", Email: "${u.email}"`))
    console.log('---------------------------------------')
    
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

rawCheck()
