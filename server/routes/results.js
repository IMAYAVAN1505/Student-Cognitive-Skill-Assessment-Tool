const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Result = require('../models/Result');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.resultId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

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
      .populate('assessment', 'title')
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

router.post('/upload-assignment/:resultId', auth, requireRole('student'), upload.single('assignment'), async (req, res) => {
  try {
    console.log('Upload request for result:', req.params.resultId);
    console.log('Headers:', req.headers['content-type']);
    console.log('File:', req.file);

    const result = await Result.findOne({ _id: req.params.resultId, student: req.user.id });
    if (!result) {
      console.log('Result not found or not owned by student');
      return res.status(404).json({ message: 'Result not found' });
    }

    if (!req.file) {
      console.log('No file received by Multer');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old file if exists
    if (result.assignmentFile) {
      const oldPath = path.join(uploadDir, result.assignmentFile);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Error deleting old file:', e);
        }
      }
    }

    result.assignmentFile = req.file.filename;
    await result.save();

    console.log('File saved successfully:', req.file.filename);
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
