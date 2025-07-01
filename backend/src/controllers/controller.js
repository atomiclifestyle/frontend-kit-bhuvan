const axios = require('axios');
// const { HttpsProxyAgent } = require('https-proxy-agent');

// const proxy = process.env.PROXY;

// const proxyAgent = new HttpsProxyAgent(process.env.PROXY);

const bhuvanApiRequest = async (url, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${url}&token=${process.env.TOKEN}`,
      timeout: 10000,
      headers: {
        'Content-Type': method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
      },
      httpsAgent: proxyAgent,
      proxy: false,
    };
    if (data) config.data = data;
    const response = await axios(config);
    return response;
  } catch (error) {
    throw error;
  }
};

exports.getRouting = async (req, res) => {
  const { lat1, lon1, lat2, lon2 } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&token=${process.env.ROUTE_TOKEN}`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // httpsAgent: proxyAgent,
      // proxy: false,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.getThematicData = async (req, res) => {
  const { lat, lon, year } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/lulc250k/curl_lulc250k_point.php?lat=${lat}&lon=${lon}&year=${year}&token=${process.env.THEMATIC_TOKEN}`;

  try {
    const response = await axios.get(url, {
      timeout: 100000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.villageGeocoding = async (req, res) => {
  const { village } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/api_proximity/curl_village_geocode.php?village=${village}&token=${process.env.VG_TOKEN}`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.getEllipsoid = async (req, res) => {
  const { id } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/geoid/curl_gdal_api.php?id=${id}&datum=elipsoid&se=CDEM&key=${process.env.GEOID_TOKEN}`;

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 10000,
      headers: {
        'Content-Type': 'application/zip',
        'Contend-Deposition': 'attachment',
      },
    });
    response.data.pipe(res);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

exports.getFloodRunoff = async (req, res) => {
  const { catchmentId, outletLat, outletLon } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/floodrunoff?catchmentId=${catchmentId}&outletLat=${outletLat}&outletLon=${outletLon}`;

  try {
    const response = await bhuvanApiRequest(url);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};