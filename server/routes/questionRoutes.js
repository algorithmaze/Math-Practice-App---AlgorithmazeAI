const express = require('express');
const router = express.Router();
const { getQuestionsByTopic, createQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
// const { admin } = require('../middleware/roleMiddleware'); // Example if admin role check is added

// @route   GET /api/questions/topic/:topicId
// @desc    Get questions by topic, optionally filtered by difficulty query param (e.g., ?difficulty=EASY)
// @access  Public (or Private if question viewing requires login)
router.get('/topic/:topicId', getQuestionsByTopic);


// @route   POST /api/questions
// @desc    Create a new question
// @access  Private/Admin (For seeding or admin panel. Requires auth. Admin role check is ideal.)
router.post('/', protect, createQuestion); // For now, only 'protect'. Add admin check later if needed.

module.exports = router;
