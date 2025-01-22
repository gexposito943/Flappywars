const express = require('express');
const router = express.Router();
const shipController = require('../controllers/shipController');

router.get('/naus', shipController.getShips);

module.exports = router; 