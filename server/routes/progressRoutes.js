const express = require('express');
const router = express.Router();
const { getTopicProgress, submitAnswerAndUpdateProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware'); // Middleware to protect routes

// @route   GET /api/progress/topic/:topicId
// @desc    Get student progress for a specific topic
// @access  Private (requires user authentication)
router.get('/topic/:topicId', protect, getTopicProgress);

// @route   POST /api/progress/submit-answer
// @desc    Submit an answer and update student progress, including difficulty adjustment
// @access  Private (requires user authentication)
router.post('/submit-answer', protect, submitAnswerAndUpdateProgress);

module.exports = router;
