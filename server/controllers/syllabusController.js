const SyllabusUnit = require('../models/SyllabusUnit');
const Topic = require('../models/Topic');

// @desc    Get all syllabus units
// @route   GET /api/syllabus/units
// @access  Public (or Private if auth is desired for syllabus viewing)
const getAllUnits = async (req, res) => {
  try {
    const units = await SyllabusUnit.find().sort({ order: 1, name: 1 }); // Sort by order, then name
    res.status(200).json(units);
  } catch (error) {
    console.error('Error fetching syllabus units:', error);
    res.status(500).json({ message: 'Server error while fetching syllabus units.' });
  }
};

// @desc    Get all topics for a specific unit
// @route   GET /api/syllabus/units/:unitId/topics
// @access  Public (or Private)
const getTopicsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    if (!unitId.match(/^[0-9a-fA-F]{24}$/)) { // Check if unitId is a valid ObjectId
        return res.status(400).json({ message: 'Invalid Unit ID format.' });
    }

    // First, check if the unit actually exists to provide a better error message
    const unitExists = await SyllabusUnit.findById(unitId);
    if (!unitExists) {
      return res.status(404).json({ message: 'Syllabus unit not found.' });
    }

    const topics = await Topic.find({ unit_id: unitId }).sort({ order: 1, name: 1 }); // Sort by order, then name

    // if (topics.length === 0) {
    //   // Decide if this should be a 404 or just an empty array. Empty array is usually fine.
    //   return res.status(404).json({ message: 'No topics found for this unit.' });
    // }

    res.status(200).json(topics);
  } catch (error) {
    console.error('Error fetching topics for unit:', error);
    res.status(500).json({ message: 'Server error while fetching topics.' });
  }
};

module.exports = {
  getAllUnits,
  getTopicsByUnit,
};
