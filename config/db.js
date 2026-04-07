/**
 * db.js — Establishes and exports a MongoDB connection using Mongoose.
 *
 * Called once at startup before the Express server begins accepting requests.
 * Throws on failure so the process exits early rather than running without a database.
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI defined in the environment.
 *
 * @returns {Promise<void>} Resolves when the connection is established.
 * @throws {Error} If the connection fails.
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected:', process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Exit the process — the app cannot function without a database.
    throw error;
  }
}

module.exports = connectDB;
