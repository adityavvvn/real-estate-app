const express = require('express');
const router = express.Router();
const multer = require('multer');
const Property = require('../models/Property');
const verifyToken = require('../middleware/auth');
const path = require('path');
const nodemailer = require('nodemailer');

// --- File Upload Setup ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- Add New Property ---
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file
    ? `/uploads/${path.basename(req.file.path)}`
    : req.body.image || '';  
    const newProp = new Property({
      ...req.body,
      image: imagePath,
      userId: req.user.id,
    });
    await newProp.save();
    res.status(201).json(newProp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add property' });
  }
});

// --- Get Properties for Logged-in User ---
router.get('/my-properties', verifyToken, async (req, res) => {
  try {
    const props = await Property.find({ userId: req.user.id });
    res.json(props);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

// --- Get All Properties with Optional Filters ---
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, bhk, area, suggestNearby, lat, lng, radiusKm } = req.query;

    const filter = {};
    if (city) filter.city = new RegExp(city, 'i');
    if (area) filter.areaName = new RegExp(area, 'i');
    if (bhk) filter.bhk = Number(bhk);
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    const properties = await Property.find(filter);

    if (properties.length > 0 || suggestNearby !== 'true') {
      return res.json(properties);
    }

    // If no results and suggestNearby is enabled and we have coords, fallback to nearby search
    const latitude = lat ? Number(lat) : undefined;
    const longitude = lng ? Number(lng) : undefined;
    const maxDistanceMeters = Number(radiusKm || 5) * 1000; // default 5km

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const nearby = await Property.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] },
            $maxDistance: maxDistanceMeters
          }
        }
      });
      res.set('X-Suggested', 'true');
      return res.json(nearby);
    }

    return res.json([]);
  } catch (err) {
    console.error('Error fetching properties:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Get Single Property by ID ---
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching property with ID:', req.params.id); // Debug log
    const prop = await Property.findById(req.params.id).populate('userId', 'name email');
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    res.json(prop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});


// --- Edit Property ---
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    if (prop.userId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized' });

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// --- Delete Property ---
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    if (prop.userId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized' });

    await prop.deleteOne();
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// --- Contact Owner (Send Email) ---
router.post('/:id/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const prop = await Property.findById(req.params.id).populate('userId', 'name email');
    if (!prop || !prop.userId || !prop.userId.email) {
      return res.status(404).json({ error: 'Property owner not found.' });
    }
    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    // Compose email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: prop.userId.email,
      subject: `New inquiry for your property: ${prop.title}`,
      text: `You have received a new inquiry for your property.\n\nFrom: ${name} <${email}>\n\nMessage:\n${message}`,
      replyTo: email,
    };
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Add notification for the property owner with better error handling
    try {
      const UserNew = require('../models/UserNew');
      const notification = {
        message: `You received a new inquiry for "${prop.title}" from ${name}.`,
        type: 'inquiry',
        link: `/property/${prop._id}`,
        read: false,
        createdAt: new Date()
      };

      await UserNew.findByIdAndUpdate(
        prop.userId._id || prop.userId,
        {
          $push: {
            notifications: notification
          }
        },
        { 
          new: true,
          runValidators: true 
        }
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Don't fail the entire request if notification fails
    }
    
    res.json({ message: 'Inquiry sent to property owner.' });
  } catch (err) {
    console.error('Failed to send inquiry email:', err);
    res.status(500).json({ error: 'Failed to send inquiry.' });
  }
});

// --- Book Property ---
router.post('/:id/book', async (req, res) => {
  try {
    const { name, email, date, time, message } = req.body;
    if (!name || !email || !date) {
      return res.status(400).json({ error: 'Name, email, and date are required.' });
    }
    
    const prop = await Property.findById(req.params.id).populate('userId', 'name email');
    if (!prop || !prop.userId || !prop.userId.email) {
      return res.status(404).json({ error: 'Property owner not found.' });
    }

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Compose booking email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: prop.userId.email,
      subject: `New booking request for your property: ${prop.title}`,
      text: `You have received a new booking request for your property.\n\nFrom: ${name} <${email}>\nDate: ${date}\nTime: ${time || 'Not specified'}\n\nMessage:\n${message || 'No additional message'}`,
      replyTo: email,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Add notification for the property owner with better error handling
    try {
      const UserNew = require('../models/UserNew');
      const notification = {
        message: `You received a new booking request for "${prop.title}" from ${name} on ${date}.`,
        type: 'booking',
        link: `/property/${prop._id}`,
        read: false,
        createdAt: new Date()
      };

      await UserNew.findByIdAndUpdate(
        prop.userId._id || prop.userId,
        {
          $push: {
            notifications: notification
          }
        },
        { 
          new: true,
          runValidators: true 
        }
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Don't fail the entire request if notification fails
    }

    res.json({ message: 'Booking request sent to property owner.' });
  } catch (err) {
    console.error('Failed to send booking request:', err);
    res.status(500).json({ error: 'Failed to send booking request.' });
  }
});

module.exports = router;
