// lib/dbConnect.js
// require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI; // Pastikan Anda menyimpan URI di variabel lingkungan

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function dbConnect() {
  try {
    await mongoose.connect(uri, {
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    });
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Keluar dari aplikasi jika koneksi gagal
  }
}

module.exports = dbConnect;
