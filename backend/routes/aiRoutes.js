const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const upload = require('../middleware/uploadMiddleware');

// POST /api/detect - Analyze photo and identify civic problem category, confidence & severity
router.post('/detect', upload.single('image'), aiController.classifyImage);

// Also alias directly to POST /api/detect at top-level
module.exports = router;
