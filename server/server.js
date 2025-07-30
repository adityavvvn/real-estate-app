// Load .env FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Property = require('./models/Property');

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROUTES
app.use('/properties', require('./routes/properties'));
app.use('/auth', require('./routes/auth'));

// ✅ DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB error:', err));

// After connecting to MongoDB, update all properties missing 'available' to have available: true
mongoose.connection.once('open', async () => {
  try {
    const result = await Property.updateMany(
      { available: { $exists: false } },
      { $set: { available: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Updated ${result.modifiedCount} properties to set available: true`);
    }
  } catch (err) {
    console.error('Error updating properties for available field:', err);
  }
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
