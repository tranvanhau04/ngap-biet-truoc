const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, predictController.getFloodPrediction);

module.exports = router;