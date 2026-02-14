const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, course, department } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({
      name,
      email,
      password,
      role: role.toLowerCase(),
      rollNumber: rollNumber || '',
      course: course || '',
      department: department || '',
    });
    const token = generateToken(user._id);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber, course: user.course, department: user.department },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await user.populate('assignedSubjects', 'name');
    const token = generateToken(user._id);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber, course: user.course, department: user.department, assignedSubjects: user.assignedSubjects },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const id = req.user._id || req.user.id;
    const user = await User.findById(id).select('-password').populate('assignedSubjects', 'name');
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
