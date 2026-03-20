const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, studentId, password, phone } = req.body;
    if (!name || !email || !studentId || !password || !phone)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
    if (userExists) {
      const field = userExists.email === email ? 'Email' : 'Student ID';
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    const user = await User.create({ name, email, studentId, password, phone });
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Check if locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ success: false, message: 'Account is locked due to too many failed attempts. Contact Admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 24 * 60 * 60 * 1000; // lock for 24h
      }
      await user.save();
      const remaining = 5 - user.loginAttempts;
      const msg = user.loginAttempts >= 5
        ? 'Account locked after 5 failed attempts'
        : `Invalid credentials. ${remaining} attempt(s) remaining`;
      return res.status(401).json({ success: false, message: msg });
    }

    // Successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId, token: generateToken(user._id) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout
const logoutUser = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, logoutUser };
