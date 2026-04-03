const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// GET /api/admin/users?search=&role=
const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && ['Student', 'Organizer', 'Admin'].includes(role)) {
      // combine with existing $or if present
      query.role = role;
    }
    
    console.log('getUsers query:', query);
    const users = await User.find(query).select('-password');
    console.log(`Found ${users.length} users with role=${role || 'all'}`);
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('getUsers error:', error);
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

    // Do not allow admins to be suspended through the panel to avoid admin lockout.
    if (user.role === 'Admin' && status === 'Suspended') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be suspended' });
    }

    // Extra guard to prevent a user from suspending their own account.
    if (req.user && req.user._id && req.user._id.toString() === userId && status === 'Suspended') {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own account' });
    }

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

// GET /api/admin/student-registrations
const getStudentRegistrations = async (req, res) => {
  try {
    // fetch all students
    const students = await User.find({ role: 'Student' }).select('-password');

    // fetch registrations and populate event and user refs
    const registrations = await Registration.find().populate('event').populate('user', '_id');

    // map registrations per user id
    const regMap = {};
    registrations.forEach(r => {
      if (!r.user) return;
      const uid = r.user._id.toString();
      if (!regMap[uid]) regMap[uid] = [];
      if (r.event) regMap[uid].push(r.event);
    });

    const result = students.map(s => ({ user: s, events: regMap[s._id.toString()] || [] }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:userId
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Do not allow an admin to delete themselves to prevent lockout
    if (req.user && req.user._id && req.user._id.toString() === userId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account from here' });
    }

    // trigger the findOneAndDelete middleware we added
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'User and all associated records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, updateUserRole, updateUserStatus, unlockUser, getOrganizerEvents, getStudentRegistrations, deleteUser };
