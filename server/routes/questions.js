const express = require('express');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Assessment = require('../models/Assessment');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = subject ? { subject } : {};
    const questions = await Question.find(filter).populate('subject', 'name').populate('createdBy', 'name');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const subject = await Subject.findById(req.body.subject);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const userId = req.user._id || req.user.id;
    const assigned = subject.assignedTeachers.some(t => t.toString() === userId.toString());
    if (!assigned) return res.status(403).json({ message: 'You are not assigned to this subject' });
    const question = await Question.create({ ...req.body, createdBy: userId });

    // Ensure there is an assessment for this subject so students can see/take it.
    // We keep one assessment per subject and add new questions to it.
    await Assessment.findOneAndUpdate(
      { subject: subject._id },
      {
        $setOnInsert: {
          subject: subject._id,
          title: `${subject.name} - Assessment`,
          description: `Assessment for ${subject.name}`,
          durationMinutes: 15,
          scheduledAt: new Date(),
          createdBy: userId,
        },
        $addToSet: { questions: question._id },
      },
      { upsert: true, new: true }
    );

    res.status(201).json(await question.populate(['subject', 'createdBy']));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const userId = req.user._id || req.user.id;
    if (question.createdBy.toString() !== userId.toString()) return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.findById(question.subject);
    const assigned = subject.assignedTeachers.some(t => t.toString() === userId.toString());
    if (!assigned) return res.status(403).json({ message: 'Not assigned to this subject' });
    Object.assign(question, req.body);
    await question.save();
    res.json(await question.populate(['subject', 'createdBy']));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const userId = req.user._id || req.user.id;
    if (req.user.role === 'teacher' && question.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await question.deleteOne();
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
