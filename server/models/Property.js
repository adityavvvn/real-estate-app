const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  city: { type: String, required: true },
  // Number of bedrooms, e.g., 1 for 1BHK, 2 for 2BHK, etc.
  bhk: { type: Number },
  // Human-readable neighborhood/locality/area name
  areaName: { type: String },
  // GeoJSON point for geospatial queries: { type: 'Point', coordinates: [lng, lat] }
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: undefined
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
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

// Enable geospatial queries when location is provided
propertySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
