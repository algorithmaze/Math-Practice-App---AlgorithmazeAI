const express = require('express');
const router = express.Router();
const { getAllUnits, getTopicsByUnit } = require('../controllers/syllabusController');
// const { protect } = require('../middleware/authMiddleware'); // Add if syllabus routes need protection

// @route   GET /api/syllabus/units
// @desc    Get all syllabus units
// @access  Public (can be changed to Private by adding 'protect' middleware)
router.get('/units', getAllUnits);

// @route   GET /api/syllabus/units/:unitId/topics
// @desc    Get all topics for a specific unit ID
// @access  Public (can be changed to Private by adding 'protect' middleware)
router.get('/units/:unitId/topics', getTopicsByUnit);

module.exports = router;
