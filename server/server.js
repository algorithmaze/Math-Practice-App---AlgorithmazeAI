const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json()); // To accept JSON data in req.body

// Mount routers
app.use('/api/auth', authRoutes);
const progressRoutes = require('./routes/progressRoutes'); // Import progress routes
app.use('/api/progress', progressRoutes); // Mount progress routes
const syllabusRoutes = require('./routes/syllabusRoutes'); // Import syllabus routes
app.use('/api/syllabus', syllabusRoutes); // Mount syllabus routes
const questionRoutes = require('./routes/questionRoutes'); // Import question routes
app.use('/api/questions', questionRoutes); // Mount question routes


// Basic error handling middleware (example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
