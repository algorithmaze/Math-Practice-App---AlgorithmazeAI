const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Fetch the saved user to ensure `select: false` for password is respected
    const registeredUser = await User.findById(user._id);


    res.status(201).json({
      _id: registeredUser._id,
      username: registeredUser.username,
      email: registeredUser.email,
      token: generateToken(registeredUser._id),
      message: 'User registered successfully'
    });

  } catch (err) {
    console.error('Register Error:', err.message);
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for user by email or username
    let user;
    if (validator.isEmail(emailOrUsername)) {
      user = await User.findOne({ email: emailOrUsername }).select('+password');
    } else {
      user = await User.findOne({ username: emailOrUsername }).select('+password');
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password mismatch)' });
    }

    // Fetch the user again without the password to send in the response
    const loggedInUser = await User.findById(user._id);

    res.json({
      _id: loggedInUser._id,
      username: loggedInUser.username,
      email: loggedInUser.email,
      token: generateToken(loggedInUser._id),
      message: 'User logged in successfully'
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile (Example of a protected route)
// @route   GET /api/auth/profile
// @access  Private (requires token)
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
