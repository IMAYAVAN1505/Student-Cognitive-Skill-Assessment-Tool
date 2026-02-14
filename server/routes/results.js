const express = require('express');
const Result = require('../models/Result');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/submit', auth, requireRole('student'), async (req, res) => {
  try {
    const { assessmentId, answers, isFinal = true } = req.body;
    const assessment = await Assessment.findById(assessmentId).populate('questions');
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    let score = 0;
    const resultAnswers = [];
    for (const q of assessment.questions) {
      const userAnswer = answers[q._id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) score++;
      resultAnswers.push({
        questionId: q._id,
        selectedAnswer: userAnswer || '',
        isCorrect,
      });
    }

    const totalQuestions = assessment.questions.length;
    const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

    // Check for existing unsubmitted result
    let result = await Result.findOne({
      student: req.user.id,
      assessment: assessmentId,
      submitted: false,
    });

    if (result) {
      result.score = score;
      result.totalQuestions = totalQuestions;
      result.percentage = percentage;
      result.answers = resultAnswers;
      result.submitted = isFinal;
      if (isFinal) result.completedAt = new Date();
      await result.save();
    } else {
      result = await Result.create({
        student: req.user.id,
        assessment: assessmentId,
        subject: assessment.subject,
        score,
        totalQuestions,
        percentage,
        answers: resultAnswers,
        submitted: isFinal,
        completedAt: isFinal ? new Date() : undefined,
      });
    }

    res.status(201).json(await result.populate(['assessment', 'subject']));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my-results', auth, requireRole('student'), async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('assessment', 'title scheduledAt')
      .populate('subject', 'name')
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/student/:studentId', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId })
      .populate('assessment', 'title')
      .populate('subject', 'name')
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/dashboard-stats', auth, requireRole('student'), async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('subject', 'name')
      .sort({ completedAt: 1 });
    const bySubject = {};
    results.forEach(r => {
      const name = r.subject?.name || 'Unknown';
      if (!bySubject[name]) bySubject[name] = [];
      bySubject[name].push({ percentage: r.percentage, date: r.completedAt });
    });
    const skillSummary = {};
    results.forEach(r => {
      const name = r.subject?.name;
      if (name && bySubject[name]) {
        const arr = bySubject[name];
        skillSummary[name] = Math.round(arr.reduce((a, x) => a + x.percentage, 0) / arr.length);
      }
    });
    const trendData = results.map(r => ({
      date: new Date(r.completedAt).toLocaleDateString(),
      percentage: r.percentage,
      subject: r.subject?.name,
    })).slice(-20);
    res.json({ skillSummary, trendData, recentResults: results.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
