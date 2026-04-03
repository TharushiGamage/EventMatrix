const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  studentId: {
    type: String,
    required: [true, 'Please add a student ID'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['Student', 'Organizer', 'Admin'],
    default: 'Student'
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Number
  },
  profileImage: {
    type: String,
    default: 'default.png'
  },
  organizationName: { type: String, default: '' },
  bio: { type: String, default: '' },
  website: { type: String, default: '' },
  phone: { type: String, default: '' },
  otpCode: { type: String },
  otpExpire: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('findOneAndDelete', async function(next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate) {
      const userId = docToUpdate._id;
      // 1. Delete user's own registrations, notifications, and waitlists
      await mongoose.model('Registration').deleteMany({ student: userId });
      await mongoose.model('Notification').deleteMany({ recipient: userId });
      await mongoose.model('WaitingList').deleteMany({ student: userId });
      
      // 2. If user is an organizer, delete their events and everything related to those events
      const searchName = docToUpdate.organizationName || docToUpdate.name;
      if (searchName) {
        const events = await mongoose.model('Event').find({ organizedBy: searchName });
        if (events.length > 0) {
          const eventIds = events.map(e => e._id);
          await mongoose.model('Registration').deleteMany({ event: { $in: eventIds } });
          await mongoose.model('WaitingList').deleteMany({ event: { $in: eventIds } });
          await mongoose.model('Event').deleteMany({ _id: { $in: eventIds } });
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const userId = this._id;
    await mongoose.model('Registration').deleteMany({ student: userId });
    await mongoose.model('Notification').deleteMany({ recipient: userId });
    await mongoose.model('WaitingList').deleteMany({ student: userId });
    
    const searchName = this.organizationName || this.name;
    if (searchName) {
      const events = await mongoose.model('Event').find({ organizedBy: searchName });
      if (events.length > 0) {
        const eventIds = events.map(e => e._id);
        await mongoose.model('Registration').deleteMany({ event: { $in: eventIds } });
        await mongoose.model('WaitingList').deleteMany({ event: { $in: eventIds } });
        await mongoose.model('Event').deleteMany({ _id: { $in: eventIds } });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
