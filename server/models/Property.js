const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  city: { type: String, required: true },
  image: { type: String }, // single image for backward compatibility
  images: [{ type: String }], // array of image URLs
  available: { type: Boolean, default: true }, // new: property availability
  bookings: [ // new: array of bookings
    {
      name: String,
      email: String,
      date: String,
      time: String,
      message: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserNew', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
