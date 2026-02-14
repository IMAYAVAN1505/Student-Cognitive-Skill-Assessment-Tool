const express = require('express');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('assignedTeachers', 'name email');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid subject ID format' });
    }
    const subject = await Subject.findById(req.params.id).populate('assignedTeachers', 'name email');
    if (!subject) return res.status(404).json({ message: 'Subject not found in database' });
    res.json(subject);
  } catch (err) {
    console.error('Error fetching subject:', err);
    res.status(500).json({ message: 'Internal server error while fetching subject' });
  }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/assign-teachers', auth, requireRole('admin'), async (req, res) => {
  try {
    const { assignedTeachers } = req.body;
    const subjectId = req.params.id;
    const newTeacherIds = (assignedTeachers || []).map(id => new mongoose.Types.ObjectId(id));

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const previousTeacherIds = (subject.assignedTeachers || []).map(t => t.toString());

    await Subject.findByIdAndUpdate(subjectId, { assignedTeachers: newTeacherIds });

    for (const teacherId of newTeacherIds) {
      const tid = teacherId.toString();
      await User.findByIdAndUpdate(teacherId, {
        $addToSet: { assignedSubjects: subjectId },
      });
    }
    for (const oldId of previousTeacherIds) {
      if (!newTeacherIds.some(n => n.toString() === oldId)) {
        await User.findByIdAndUpdate(oldId, {
          $pull: { assignedSubjects: subjectId },
        });
      }
    }

    const updated = await Subject.findById(subjectId).populate('assignedTeachers', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
