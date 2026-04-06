const express = require('express');
const User = require('../models/User');
const Result = require('../models/Result');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    let users = await User.find(filter).select('-password').populate('assignedSubjects', 'name').lean();

    // If fetching students, add completedSubjectsCount
    if (req.query.role === 'student') {
      const stats = await Result.aggregate([
        {
          $group: {
            _id: '$student',
            subjects: { $addToSet: '$subject' },
            assignmentsCount: {
              $sum: { $cond: [{ $gt: ['$assignmentFile', null] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 1,
            subjectsCount: { $size: '$subjects' },
            assignmentsCount: 1
          }
        }
      ]);

      const statsMap = {};
      stats.forEach(s => {
        if (s._id) {
          statsMap[s._id.toString()] = {
            subjectsCount: s.subjectsCount,
            assignmentsCount: s.assignmentsCount
          };
        }
      });

      users = users.map(u => ({
        ...u,
        completedSubjectsCount: statsMap[u._id.toString()]?.subjectsCount || 0,
        assignmentsCount: statsMap[u._id.toString()]?.assignmentsCount || 0
      }));
    }

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
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, rollNumber, course, department } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, rollNumber, course, department },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    await updatedUser.populate('assignedSubjects', 'name');

    // Return a structured user object compatible with frontend state
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      rollNumber: updatedUser.rollNumber,
      course: updatedUser.course,
      department: updatedUser.department,
      assignedSubjects: updatedUser.assignedSubjects
    });
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
