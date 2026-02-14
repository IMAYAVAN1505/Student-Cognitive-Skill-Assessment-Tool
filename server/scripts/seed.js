require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Question = require('../models/Question');
const Assessment = require('../models/Assessment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cognitive-assessment';

const subjects = [
  'Memory Skills',
  'Attention & Focus',
  'Logical Reasoning',
  'Problem Solving',
  'Verbal Ability',
  'Numerical Ability',
  'Analytical Thinking',
  'Critical Thinking',
  'Decision Making',
  'Pattern Recognition',
];

const questionsBySubject = {
  'Memory Skills': [
    { q: 'What is the most effective technique for remembering a list of unrelated items?', opts: ['Rote repetition', 'Creating a story linking the items', 'Reading once', 'Writing in reverse order'], correct: 'Creating a story linking the items', diff: 'Easy' },
    { q: 'Which factor most negatively affects short-term memory capacity?', opts: ['Sleep deprivation', 'Drinking water', 'Quiet environment', 'Taking notes'], correct: 'Sleep deprivation', diff: 'Medium' },
    { q: 'In the "method of loci", you improve memory by associating information with:', opts: ['Familiar locations', 'Colors', 'Numbers', 'Sounds'], correct: 'Familiar locations', diff: 'Hard' },
  ],
  'Attention & Focus': [
    { q: 'What is a recommended way to improve sustained attention during study?', opts: ['Multitasking', 'Pomodoro technique (25 min focus, 5 min break)', 'No breaks until done', 'Background TV'], correct: 'Pomodoro technique (25 min focus, 5 min break)', diff: 'Easy' },
    { q: 'Which is most likely to reduce distractions and improve focus?', opts: ['Checking notifications every 5 minutes', 'Single-tasking and turning off alerts', 'Working in a busy café', 'Switching tasks every 10 minutes'], correct: 'Single-tasking and turning off alerts', diff: 'Medium' },
    { q: 'Selective attention allows you to:', opts: ['Process all stimuli equally', 'Focus on one stimulus while ignoring others', 'Remember everything you see', 'Listen to multiple conversations at once'], correct: 'Focus on one stimulus while ignoring others', diff: 'Hard' },
  ],
  'Logical Reasoning': [
    { q: 'If all A are B, and all B are C, then:', opts: ['All A are C', 'No A are C', 'Some C are not A', 'All C are A'], correct: 'All A are C', diff: 'Easy' },
    { q: 'What comes next: 2, 4, 8, 16, ___?', opts: ['24', '32', '20', '18'], correct: '32', diff: 'Medium' },
    { q: 'A statement is logically equivalent to its contrapositive. If "If P then Q" is true, then:', opts: ['If not Q then not P is true', 'If Q then P is true', 'If not P then not Q is true', 'P and Q are always true'], correct: 'If not Q then not P is true', diff: 'Hard' },
  ],
  'Problem Solving': [
    { q: 'The first step in a structured problem-solving approach is usually:', opts: ['Implement solution', 'Define the problem', 'Evaluate alternatives', 'Choose the best option'], correct: 'Define the problem', diff: 'Easy' },
    { q: 'Breaking a complex problem into smaller sub-problems is called:', opts: ['Decomposition', 'Guessing', 'Avoidance', 'Repetition'], correct: 'Decomposition', diff: 'Medium' },
    { q: 'When a solution does not work, the best next step is:', opts: ['Give up', 'Analyze why it failed and try another approach', 'Repeat the same solution', 'Blame others'], correct: 'Analyze why it failed and try another approach', diff: 'Hard' },
  ],
  'Verbal Ability': [
    { q: '"Benevolent" is closest in meaning to:', opts: ['Strict', 'Kind', 'Silent', 'Angry'], correct: 'Kind', diff: 'Easy' },
    { q: 'Choose the correct sentence:', opts: ['Neither the teacher nor the students was present.', 'Neither the teacher nor the students were present.', 'Neither the teacher or the students were present.', 'Neither teacher nor students was present.'], correct: 'Neither the teacher nor the students were present.', diff: 'Medium' },
    { q: 'An argument that attacks the person instead of the argument is called:', opts: ['Ad hominem', 'Straw man', 'Appeal to authority', 'False dilemma'], correct: 'Ad hominem', diff: 'Hard' },
  ],
  'Numerical Ability': [
    { q: '15% of 80 is:', opts: ['10', '12', '15', '8'], correct: '12', diff: 'Easy' },
    { q: 'A shirt costs $40 after a 20% discount. Original price was:', opts: ['$48', '$50', '$52', '$45'], correct: '$50', diff: 'Medium' },
    { q: 'In a ratio 3:5, if the smaller part is 21, the larger part is:', opts: ['28', '35', '42', '30'], correct: '35', diff: 'Hard' },
  ],
  'Analytical Thinking': [
    { q: 'Analyzing data to find patterns and trends is part of:', opts: ['Creative writing', 'Analytical thinking', 'Memorization', 'Physical exercise'], correct: 'Analytical thinking', diff: 'Easy' },
    { q: 'When comparing two options, the most analytical approach is to:', opts: ['Choose the first one', 'List pros/cons and criteria, then evaluate', 'Ask someone else', 'Flip a coin'], correct: 'List pros/cons and criteria, then evaluate', diff: 'Medium' },
    { q: 'Identifying assumptions in an argument helps to:', opts: ['Accept the conclusion blindly', 'Evaluate the strength of the argument', 'Ignore evidence', 'Shorten the argument'], correct: 'Evaluate the strength of the argument', diff: 'Hard' },
  ],
  'Critical Thinking': [
    { q: 'Critical thinking involves:', opts: ['Accepting all claims', 'Evaluating evidence and reasoning', 'Following opinions only', 'Avoiding questions'], correct: 'Evaluating evidence and reasoning', diff: 'Easy' },
    { q: 'A reliable source for critical evaluation is one that:', opts: ['Agrees with you', 'Is peer-reviewed and evidence-based', 'Is popular on social media', 'Has a strong opinion'], correct: 'Is peer-reviewed and evidence-based', diff: 'Medium' },
    { q: 'Identifying logical fallacies helps you:', opts: ['Win arguments', 'Recognize weak or invalid reasoning', 'Memorize facts', 'Write faster'], correct: 'Recognize weak or invalid reasoning', diff: 'Hard' },
  ],
  'Decision Making': [
    { q: 'In decision making, considering opportunity cost means:', opts: ['Ignoring alternatives', 'Considering what you give up by choosing one option', 'Choosing the cheapest option', 'Delaying the decision'], correct: 'Considering what you give up by choosing one option', diff: 'Easy' },
    { q: 'A decision matrix is used to:', opts: ['Avoid decisions', 'Compare options against multiple criteria', 'Randomly select an option', 'Delegate the decision'], correct: 'Compare options against multiple criteria', diff: 'Medium' },
    { q: 'When outcomes are uncertain, a rational approach may include:', opts: ['Ignoring risk', 'Estimating probabilities and expected value', 'Choosing the riskiest option', 'Waiting for certainty'], correct: 'Estimating probabilities and expected value', diff: 'Hard' },
  ],
  'Pattern Recognition': [
    { q: 'What number comes next: 1, 1, 2, 3, 5, 8, ___?', opts: ['11', '13', '12', '10'], correct: '13', diff: 'Easy' },
    { q: 'In the sequence O, T, T, F, F, S, S, E, the next letter is:', opts: ['N', 'T', 'E', 'O'], correct: 'N', diff: 'Medium' },
    { q: 'Pattern in shapes: Circle, Square, Circle, Square, Circle, ___?', opts: ['Triangle', 'Square', 'Circle', 'Hexagon'], correct: 'Square', diff: 'Hard' },
  ],
};

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteMany({});
  await Subject.deleteMany({});
  await Question.deleteMany({});
  await Assessment.deleteMany({});

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@cognitive.com',
    password: 'admin123',
    role: 'admin',
  });

  const teacher = await User.create({
    name: 'Jane Teacher',
    email: 'teacher@cognitive.com',
    password: 'teacher123',
    role: 'teacher',
  });

  const student = await User.create({
    name: 'John Student',
    email: 'student@cognitive.com',
    password: 'student123',
    role: 'student',
    rollNumber: 'STU001',
    course: 'B.Sc. Cognitive Science',
    department: 'Psychology',
  });

  await User.create({
    name: 'Sabarish',
    email: 'sabarish@gmail.com',
    password: 'sabarish123',
    role: 'student',
    rollNumber: 'STU002',
    course: 'B.Sc. Cognitive Science',
    department: 'Psychology',
  });

  const subjectDocs = [];
  for (const name of subjects) {
    const sub = await Subject.create({ name });
    subjectDocs.push(sub);
  }

  for (const sub of subjectDocs) {
    sub.assignedTeachers.push(teacher._id);
    await sub.save();
  }

  await User.findByIdAndUpdate(teacher._id, { assignedSubjects: subjectDocs.map(s => s._id) });

  const questionIds = [];
  for (const sub of subjectDocs) {
    const list = questionsBySubject[sub.name];
    if (!list) continue;
    for (const item of list) {
      const q = await Question.create({
        subject: sub._id,
        questionText: item.q,
        options: item.opts,
        correctAnswer: item.correct,
        difficulty: item.diff,
        createdBy: teacher._id,
      });
      questionIds.push({ subjectId: sub._id, qid: q._id });
    }
  }

  for (const sub of subjectDocs) {
    const qids = questionIds.filter(q => q.subjectId.toString() === sub._id.toString()).map(q => q.qid);
    if (qids.length) {
      await Assessment.create({
        subject: sub._id,
        title: `${sub.name} - Assessment`,
        description: `Assessment for ${sub.name}`,
        questions: qids,
        durationMinutes: 15,
        scheduledAt: new Date(),
        createdBy: admin._id,
      });
    }
  }

  console.log('Seeded: 1 admin, 1 teacher, 2 students (student@cognitive.com, sabarish@gmail.com), 10 subjects, 30 questions, 10 assessments.');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
