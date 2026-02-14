const express = require('express');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('-password').populate('assignedSubjects', 'name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('assignedSubjects', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, rollNumber, course, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, rollNumber, course, department },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/assign-subjects', auth, requireRole('admin'), async (req, res) => {
  try {
    const { assignedSubjects } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { assignedSubjects: assignedSubjects || [] },
      { new: true }
    ).select('-password').populate('assignedSubjects', 'name');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
