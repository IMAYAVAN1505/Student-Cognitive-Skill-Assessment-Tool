const express = require('express');
const Assessment = require('../models/Assessment');
const Result = require('../models/Result');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const q = Assessment.find().populate('subject', 'name').sort({ scheduledAt: -1 });3
    // Don't expose full question objects (incl. correctAnswer) in list view to students.
    if (req.user?.role !== 'student') {
      q.populate('questions');
    }
    const assessments = await q;
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('subject', 'name')
      .populate('questions');
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/attempt', auth, requireRole('student'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('subject', 'name')
      .populate({
        path: 'questions',
        select: 'questionText options difficulty',
      });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    const questions = assessment.questions || [];
    if (questions.length === 0) {
      return res.status(400).json({ message: 'This assessment has no questions yet.' });
    }

    const questionsForStudent = questions.map(q => {
      const doc = q.toObject ? q.toObject() : q;
      if (!doc.questionText || !Array.isArray(doc.options) || doc.options.length === 0) {
        console.warn('Question missing required fields:', doc._id);
      }
      return {
        _id: doc._id || doc._id?.toString(),
        questionText: doc.questionText || 'Question text not available',
        options: Array.isArray(doc.options) && doc.options.length > 0 ? doc.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        difficulty: doc.difficulty || 'Medium',
      };
    });

    // Fetch existing draft if any
    const existingDraft = await Result.findOne({
      student: req.user.id,
      assessment: req.params.id,
      submitted: false,
    });

    const draftAnswers = {};
    if (existingDraft && Array.isArray(existingDraft.answers)) {
      existingDraft.answers.forEach(a => {
        if (a.questionId) draftAnswers[a.questionId.toString()] = a.selectedAnswer;
      });
    }

    res.json({
      _id: assessment._id,
      title: assessment.title || 'Assessment',
      subject: assessment.subject,
      durationMinutes: assessment.durationMinutes || 30,
      questions: questionsForStudent,
      draftAnswers,
    });
  } catch (err) {
    console.error('Error in attempt endpoint:', err);
    res.status(500).json({ message: err.message || 'Failed to load assessment' });
  }
});

router.post('/', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const assessment = await Assessment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(await assessment.populate(['subject', 'questions']));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('subject', 'name')
      .populate('questions');
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assessment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
