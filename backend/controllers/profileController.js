const User = require('../models/User');

// GET /api/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/profile/update
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Update Organizer fields if provided
    if (req.body.organizationName !== undefined) user.organizationName = req.body.organizationName;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.website !== undefined) user.website = req.body.website;
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    const updated = await user.save();

    res.json({ success: true, data: { 
      _id: updated._id, 
      name: updated.name, 
      email: updated.email, 
      role: updated.role, 
      studentId: updated.studentId,
      profileImage: updated.profileImage,
      organizationName: updated.organizationName,
      bio: updated.bio,
      website: updated.website,
      phone: updated.phone
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/profile/send-otp
const sendPasswordOtp = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.phone) {
      return res.status(400).json({ success: false, message: 'No mobile number associated with this account. Please update your profile.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otpCode = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
    await user.save();

    // Simulate sending SMS
    console.log(`\n\n[SIMULATED SMS] => Sent to ${user.phone}: Your EventMatrix password verification code is ${otp}. Valid for 5 minutes.\n\n`);

    res.json({ success: true, message: `Verification code sent to ${user.phone}! [DEMO MODE OTP: ${otp}]` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/profile/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, otpCode } = req.body;
    if (!currentPassword || !newPassword || !otpCode)
      return res.status(400).json({ success: false, message: 'Please provide current password, new password, and verification code' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

    if (!user.otpCode || user.otpCode !== otpCode) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/profile/change-password-direct
const changePasswordDirect = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current password, new password, and confirm password' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password must match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/profile/upload-image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const imagePath = `/uploaded_images/profiles/${req.file.filename}`;
    
    user.profileImage = imagePath;
    const updated = await user.save();

    res.json({ 
      success: true, 
      message: 'Profile image updated',
      data: { 
        _id: updated._id, 
        name: updated.name, 
        email: updated.email, 
        role: updated.role, 
        studentId: updated.studentId,
        profileImage: updated.profileImage,
        organizationName: updated.organizationName,
        bio: updated.bio,
        website: updated.website,
        phone: updated.phone
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/profile/delete-image
const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // If already default, nothing to delete
    if (!user.profileImage || user.profileImage === 'default.png') {
      return res.json({ success: true, message: 'No profile image to delete', data: { profileImage: 'default.png' } });
    }

    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '..', user.profileImage.replace(/^\//, ''));

    // Delete file if exists
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      // Log but continue
      console.error('Error removing profile image file:', err.message);
    }

    user.profileImage = 'default.png';
    const updated = await user.save();

    res.json({ success: true, message: 'Profile image deleted', data: { 
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      studentId: updated.studentId,
      profileImage: updated.profileImage,
      organizationName: updated.organizationName,
      bio: updated.bio,
      website: updated.website,
      phone: updated.phone
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  sendPasswordOtp,
  changePassword,
  changePasswordDirect,
  uploadProfileImage,
  deleteProfileImage,
};
