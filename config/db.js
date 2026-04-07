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
    await mongoose.connect(process.env.MONGODB_URI, {
      // Fail queries immediately if the connection drops instead of buffering them silently.
      // Without this, route handlers hang indefinitely waiting for a connection that never comes.
      bufferCommands: false,
      // Give up finding a MongoDB server after 5 seconds.
      serverSelectionTimeoutMS: 5000,
      // Give up waiting for a query response after 10 seconds.
      // Without this, queries on an established connection can hang forever.
      socketTimeoutMS: 10000,
    });
    console.log('MongoDB connected:', process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Exit the process — the app cannot function without a database.
    throw error;
  }
}

module.exports = connectDB;
