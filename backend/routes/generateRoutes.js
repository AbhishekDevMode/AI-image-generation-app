const express = require('express');
const { generateImage } = require('../controllers/generateController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, generateImage);

module.exports = router;
