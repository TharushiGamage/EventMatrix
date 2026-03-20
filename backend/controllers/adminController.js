const User = require('../models/User');
const Event = require('../models/Event');

// GET /api/admin/users?search=
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ]};
    }
    const users = await User.find(query).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/user-role
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!['Student', 'Organizer', 'Admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ success: true, message: 'Role updated', data: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/user-status
const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!['Active', 'Suspended'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.status = status;
    await user.save();
    res.json({ success: true, message: `User ${status.toLowerCase()}`, data: { _id: user._id, status: user.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/unlock-user
const unlockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    res.json({ success: true, message: 'User account unlocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/organizer-events/:userId
const getOrganizerEvents = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // The Event's organizedBy field stores a string
    const searchName = user.organizationName || user.name;
    const events = await Event.find({ organizedBy: searchName }).sort({ date: -1 });
    
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, updateUserRole, updateUserStatus, unlockUser, getOrganizerEvents };
