const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const isPhoneLike = (value = '') => /\d{7,}/.test(value.replace(/\D/g, ''));

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, studentId, password, phone } = req.body;
    console.log('Register request received for:', email);

    if (!name || !email || !studentId || !password || !phone)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
    if (userExists) {
      const field = userExists.email === email ? 'Email' : 'Student ID';
      console.log(`Registration failed: ${field} already exists`);
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    const user = await User.create({ name, email, studentId, password, phone });
    console.log('User registered successfully:', user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request received for:', email);

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      console.log('Login failed: Account locked for:', email);
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
      console.log('Login failed: Invalid password for:', email);
      return res.status(401).json({ success: false, message: msg });
    }

    // Successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    console.log('Login successful for:', email);

    res.json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId, token: generateToken(user._id) }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// POST /api/auth/logout
const logoutUser = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide email or phone number' });
    }

    const query = isPhoneLike(identifier)
      ? { phone: identifier }
      : { email: identifier.toLowerCase().trim() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email or phone number' });
    }

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    const channel = isPhoneLike(identifier) ? 'phone' : 'email';
    console.log(`\n[SIMULATED ${channel.toUpperCase()} OTP] => ${identifier}: Your EventMatrix reset code is ${otp} (valid for 5 minutes).\n`);

    return res.json({ success: true, message: `Verification code sent to your ${channel}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to send verification code' });
  }
};

// POST /api/auth/verify-reset-code
const verifyResetCode = async (req, res) => {
  try {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, message: 'Please provide identifier and verification code' });
    }

    const query = isPhoneLike(identifier)
      ? { phone: identifier }
      : { email: identifier.toLowerCase().trim() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email or phone number' });
    }

    if (!user.otpCode || user.otpCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (!user.otpExpire || Date.now() > user.otpExpire) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    return res.json({ success: true, message: 'Verification code is valid' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to verify code' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { identifier, code, newPassword, confirmPassword } = req.body;
    if (!identifier || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const query = isPhoneLike(identifier)
      ? { phone: identifier }
      : { email: identifier.toLowerCase().trim() };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email or phone number' });
    }

    if (!user.otpCode || user.otpCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (!user.otpExpire || Date.now() > user.otpExpire) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
