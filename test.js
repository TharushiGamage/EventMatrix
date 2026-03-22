const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- USERS (Organizers) ---');
  const users = await mongoose.connection.db.collection('users').find({ role: 'Organizer' }).toArray();
  for (const u of users) console.log(`Name: '${u.name}', Org: '${u.organizationName}'`);

  console.log('--- EVENTS ---');
  const events = await mongoose.connection.db.collection('events').find().toArray();
  for (const e of events) console.log(`Event: '${e.name}', OrganizedBy: '${e.organizedBy}'`);

  process.exit();
}

check().catch(console.error);
