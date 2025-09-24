const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  city: { type: String, required: true },
  bhk: { type: Number },
  areaName: { type: String },
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
  image: { type: String },
  images: [{ type: String }],
  available: { type: Boolean, default: true },
  bookings: [
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

propertySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
