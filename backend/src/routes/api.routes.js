const express = require('express');
const router = express.Router();
const bhuvanController = require('../controllers/controller');

router.get('/routing', bhuvanController.getRouting);
router.get('/thematic', bhuvanController.getThematicData);
router.get('/vg', bhuvanController.villageGeocoding);
router.get('/ellipsoid', bhuvanController.getEllipsoid);
router.get('/floodrunoff', bhuvanController.getFloodRunoff);

module.exports = router;