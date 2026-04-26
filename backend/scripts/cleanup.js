const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.db.collection('users').deleteMany({
    email: { $in: ['alice@test.com', 'bob@test.com'] }
  });
  console.log(`Deleted ${result.deletedCount} test user(s)`);
  // Also clean up any rooms/messages involving only test users
  mongoose.disconnect();
}).catch(e => { console.error(e); process.exit(1); });
