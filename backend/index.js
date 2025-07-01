const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { HttpsProxyAgent } = require('https-proxy-agent');
const bhuvanRoutes = require('./src/routes/api.routes');

const app = express();
app.use(cors());
require('dotenv').config();
app.use('/api/bhuvan', bhuvanRoutes);

// // Root route
// app.get("/", (req, res) => {
//   res.json({ message: "Node backend for Bhuvan React app" });
// });

// // Proxy Bhuvan Routing API
// app.get("/api/bhuvan/routing", async (req, res) => {
//     const { lat1, lon1, lat2, lon2 } = req.query;
  
//     const url = `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&token=${process.env.TOKEN}`;
  
//     try {
//     const proxyAgent = new HttpsProxyAgent('http://bhuvan:NRSC%40User@172.31.7.55:8080');
//       const response = await axios.get(url, {
//         timeout: 10000,
//         headers: {
//             'Content-Type': 'application/x-www-form- urlencoded'
//         },
//         httpsAgent: proxyAgent,
//         proxy: false
//     });
//       res.status(response.status).json(response.data);
      
//     } catch (error) {
      
//       // Return the actual error from the external API
//       if (error.response) {
//         res.status(error.response.status).json({ 
//           error: error.response.statusText,
//           details: error.response.data 
//         });
//       } else {
//         res.status(500).json({ error: error.message });
//       }
//     }
//   });

// Start server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
