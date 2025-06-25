const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars (for MONGO_URI)
dotenv.config({ path: path.resolve(__dirname, '../.env') });


// Load Mongoose models
const SyllabusUnit = require('../models/SyllabusUnit');
const Topic = require('../models/Topic');

// Load syllabus data from JSON file (adjust path as necessary)
// Assuming this script is in server/seeders/ and syllabus.json is in project/src/data/
const syllabusJsonPath = path.resolve(__dirname, '../../project/src/data/syllabus.json');
const syllabusData = JSON.parse(fs.readFileSync(syllabusJsonPath, 'utf-8'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for Seeder...');
  } catch (err) {
    console.error('MongoDB Seeder Connection Error:', err.message);
    process.exit(1);
  }
};

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await SyllabusUnit.deleteMany();
    await Topic.deleteMany();
    console.log('Cleared existing SyllabusUnits and Topics.');

    let unitOrder = 1;
    for (const unitData of syllabusData) {
      const syllabusUnit = new SyllabusUnit({
        // _id: unitData.id, // Letting MongoDB generate _id is usually better unless IDs are fixed
        name: unitData.name,
        description: unitData.topics[0]?.description, // Taking first topic's desc as unit desc for now
                                                      // or leave it blank if unitData.description is not available
        order: unitOrder++,
      });
      const savedUnit = await syllabusUnit.save();
      console.log(`Unit '${savedUnit.name}' created with ID ${savedUnit._id}`);

      let topicOrder = 1;
      for (const topicData of unitData.topics) {
        const topic = new Topic({
          name: topicData.name,
          description: topicData.description,
          unit_id: savedUnit._id, // Link to the newly created SyllabusUnit
          order: topicOrder++,
        });
        await topic.save();
        console.log(`  Topic '${topic.name}' created for unit '${savedUnit.name}'`);
      }
    }

    console.log('Syllabus data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

// Destroy data from DB
const destroyData = async () => {
  try {
    await SyllabusUnit.deleteMany();
    await Topic.deleteMany();
    console.log('Syllabus data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with data destruction:', error);
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
