const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bhuvanRoutes = require('./src/routes/api.routes');

const app = express();
const allowedOrigins = [
    'http://localhost:5173', // For local development
    'https://jubilant-succotash-wrr94ppjjqjpcg5pq-5173.app.github.dev' // Your Codespace frontend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// Use the configured CORS middleware
app.use(cors(corsOptions));

require('dotenv').config();
app.use('/api/bhuvan', bhuvanRoutes);

// Start server

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
