const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserNew = require('../models/UserNew');
const verifyToken = require('../middleware/auth');

// Get JWT secret from .env or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECRET_KEY';

// ✅ Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserNew.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserNew({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserNew.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Sign JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- Get User Notifications ---
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const user = await UserNew.findById(req.user.id).select('notifications');
    res.json(user.notifications || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// --- Mark Notification as Read ---
router.put('/notifications/:notificationId/read', verifyToken, async (req, res) => {
  try {
    const user = await UserNew.findById(req.user.id);
    const notification = user.notifications.id(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    await user.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// --- Delete Notification ---
router.delete('/notifications/:notificationId', verifyToken, async (req, res) => {
  try {
    const user = await UserNew.findById(req.user.id);
    user.notifications.pull(req.params.notificationId);
    await user.save();
    
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// --- Mark All Notifications as Read ---
router.put('/notifications/read-all', verifyToken, async (req, res) => {
  try {
    await UserNew.findByIdAndUpdate(req.user.id, {
      $set: { 'notifications.$[].read': true }
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
