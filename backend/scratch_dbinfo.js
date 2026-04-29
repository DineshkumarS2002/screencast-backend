require('dotenv').config()
const mongoose = require('mongoose')

async function checkDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to Database:', conn.connection.name)
    
    // List all collections to see what we have
    const collections = await conn.connection.db.listCollections().toArray()
    console.log('Collections in this DB:', collections.map(c => c.name))
    
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

checkDB()
