/**
 * index.js — Entry point for the Stratum backend.
 *
 * Startup sequence:
 *   1. Load environment variables from .env
 *   2. Connect to MongoDB
 *   3. Start the Express server
 *   4. Register the Federal Register cron job (also runs once immediately on startup)
 *
 * Design decision: The server only starts after the database connection succeeds.
 * This prevents the app from accepting requests it cannot fulfill.
 */

require('dotenv').config();

const express  = require('express');
const connectDB = require('./config/db');
const federalRegisterRoutes = require('./routes/federalRegister');
const { scheduleFetch } = require('./services/fetchFederalRegister');

const app  = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON request bodies.
app.use(express.json());

// --- Routes ---
// All Federal Register endpoints are namespaced under /api/federal-register.
app.use('/api/federal-register', federalRegisterRoutes);

/**
 * Starts the application:
 *   - Establishes a MongoDB connection
 *   - Listens for HTTP requests
 *   - Kicks off the scheduled Federal Register fetch
 */
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Stratum backend running on http://localhost:${PORT}`);
  });

  // Schedule the daily Federal Register fetch (also runs once immediately).
  scheduleFetch();
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
