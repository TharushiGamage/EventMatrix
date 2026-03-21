/**
 * Run this script ONCE to create the first Admin user.
 * Usage: node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  studentId: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: 'Student' },
  status: { type: String, default: 'Active' },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Number,
  profileImage: { type: String, default: 'default.png' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const adminData = {
    name: 'System Admin',
    email: 'admin@uems.com',
    studentId: 'ADMIN001',
    password: await bcrypt.hash('admin123', 10),
    role: 'Admin',
    status: 'Active'
  };

  try {
    // Drop any old conflicting indexes from previous schemas
    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.collection('users').dropIndexes();
      console.log('Cleared old indexes');
    }

    const existing = await User.findOne({ email: adminData.email });
    if (existing) {
      console.log('Admin already exists! Email: admin@uems.com');
    } else {
      await User.create(adminData);
      console.log('✅ Admin created successfully!');
      console.log('   Email:    admin@uems.com');
      console.log('   Password: admin123');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin();
