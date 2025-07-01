const express = require("express");
const cors = require("cors");
const bhuvanRoutes = require('./src/routes/api.routes');

const app = express();
app.use(cors());
require('dotenv').config();
app.use('/api/bhuvan', bhuvanRoutes);

// Start server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
