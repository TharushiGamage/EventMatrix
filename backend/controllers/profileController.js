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
    const updated = await user.save();

    res.json({ success: true, data: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role, studentId: updated.studentId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/profile/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, changePassword };
