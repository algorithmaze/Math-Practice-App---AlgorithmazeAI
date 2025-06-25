const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars (for MONGO_URI)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load Mongoose models
const Question = require('../models/Question');
const Topic = require('../models/Topic'); // To map topic_id strings to ObjectIds
const SyllabusUnit = require('../models/SyllabusUnit'); // Needed if mapping via unit name -> topic name

// Load questions data from JSON file
const questionsJsonPath = path.resolve(__dirname, '../../project/src/data/sampleQuestions.json');
const questionsData = JSON.parse(fs.readFileSync(questionsJsonPath, 'utf-8'));

// Load syllabus data to help map topic string IDs (like "topic2a") to ObjectIds
const syllabusJsonPath = path.resolve(__dirname, '../../project/src/data/syllabus.json');
const syllabusData = JSON.parse(fs.readFileSync(syllabusJsonPath, 'utf-8'));


// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for Question Seeder...');
  } catch (err) {
    console.error('MongoDB Question Seeder Connection Error:', err.message);
    process.exit(1);
  }
};

// Helper function to get Topic ObjectId from string ID (e.g., "topic2a")
// This assumes syllabus units and topics have been seeded already and names are unique as per model.
const getTopicObjectId = async (topicStringId) => {
  // Find which unit this topicStringId belongs to in syllabus.json
  let parentUnitName;
  let targetTopicName;

  for (const unit of syllabusData) {
    const foundTopic = unit.topics.find(t => t.id === topicStringId);
    if (foundTopic) {
      parentUnitName = unit.name;
      targetTopicName = foundTopic.name;
      break;
    }
  }

  if (!parentUnitName || !targetTopicName) {
    console.warn(`Could not find unit/topic details for string ID: ${topicStringId} in syllabus.json`);
    return null;
  }

  // Find the SyllabusUnit ObjectId by its name
  const syllabusUnitDoc = await SyllabusUnit.findOne({ name: parentUnitName });
  if (!syllabusUnitDoc) {
    console.warn(`SyllabusUnit document not found for name: ${parentUnitName}`);
    return null;
  }

  // Find the Topic ObjectId by its name and parent unit_id
  const topicDoc = await Topic.findOne({ name: targetTopicName, unit_id: syllabusUnitDoc._id });
  if (!topicDoc) {
    console.warn(`Topic document not found for name: ${targetTopicName} under unit ${parentUnitName}`);
    return null;
  }
  return topicDoc._id;
};


// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await Question.deleteMany();
    console.log('Cleared existing Questions.');

    for (const questionItem of questionsData) {
      const topicObjectId = await getTopicObjectId(questionItem.topic_id);

      if (!topicObjectId) {
        console.warn(`Skipping question ID "${questionItem.id}" from JSON due to missing topic ObjectId for topic_id "${questionItem.topic_id}". Ensure syllabus is seeded correctly.`);
        continue;
      }

      const questionToSave = {
        ...questionItem, // Spread existing fields like question_text, type, options, etc.
        topic_id: topicObjectId, // Replace string topic_id with ObjectId
        // Remove the original JSON 'id' field if it's not part of the Mongoose schema, or map it if needed
      };
      delete questionToSave.id; // Assuming 'id' from JSON is not part of Mongoose schema field name

      // Ensure 'answer' object exists and has 'explanation'
      if (!questionToSave.answer || typeof questionToSave.answer.explanation === 'undefined') {
          console.warn(`Skipping question with text "${questionToSave.question_text.substring(0,30)}..." due to missing answer.explanation.`);
          continue;
      }
      // Ensure options exist for MCQ, otherwise set to empty array if not present
      if (questionToSave.question_type === 'MCQ' && !questionToSave.options) {
          questionToSave.options = [];
      }


      const newQuestion = new Question(questionToSave);
      await newQuestion.save();
      console.log(`Question "${questionToSave.question_text.substring(0, 30)}..." imported successfully.`);
    }

    console.log('Questions Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with question data import:', error);
    process.exit(1);
  }
};

// Destroy data from DB
const destroyData = async () => {
  try {
    await Question.deleteMany();
    console.log('Questions Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with question data destruction:', error);
    process.exit(1);
  }
};

// Script execution logic
const runSeeder = async () => {
  await connectDB();

  if (process.argv[2] === '-d') { // Pass '-d' to destroy data
    await destroyData();
  } else {
    await importData();
  }
};

runSeeder();
