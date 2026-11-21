const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { optionalAuth, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/complaints - Create complaint with photo upload
router.post('/', optionalAuth, upload.single('image'), complaintController.createComplaint);

// GET /api/complaints - Get all complaints with filters
router.get('/', complaintController.getComplaints);

// GET /api/complaints/stats - Dashboard analytics & counts
router.get('/stats', complaintController.getStats);

// GET /api/complaints/:id - Single complaint by ID or tracking number
router.get('/:id', complaintController.getComplaintById);

// PUT /api/complaints/:id/status - Update complaint status (Admin / Officer action)
router.put('/:id/status', optionalAuth, complaintController.updateComplaintStatus);

module.exports = router;
