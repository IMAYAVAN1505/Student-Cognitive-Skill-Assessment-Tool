# Student Cognitive Skill Assessment Tool

A full-stack web application for assessing and tracking student cognitive skills with role-based access (Admin, Teacher, Student).

## Tech Stack

- **Frontend:** React (Create React App), HTML, CSS, JavaScript, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **IDE:** Visual Studio Code

## Features

- **Home:** Landing page with login/register
- **Student Dashboard:** Skill summary cards (Memory, Attention, Logical Reasoning, Problem Solving), Take Assessment (upcoming test, Start Test), line graph (performance trend), bar chart (skill-wise progress), Recent Results
- **Profile:** Name, email, roll number, course/department, edit and logout (profile icon top-right)
- **Admin:** Add/manage subjects, assign teachers to subjects. Pre-loaded: 10 subjects (Memory Skills, Attention & Focus, Logical Reasoning, Problem Solving, Verbal Ability, Numerical Ability, Analytical Thinking, Critical Thinking, Decision Making, Pattern Recognition)
- **Teacher:** Post questions only for assigned subjects (MCQs, 4 options, correct answer, difficulty: Easy/Medium/Hard). 30 sample questions (3 per subject) are seeded.
- **Student:** View subjects and assessments, take tests, view graphs and reports. No access to subject creation or question posting.

## Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas connection string)
- npm or yarn

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm run seed    # Creates admin, teacher, student, 10 subjects, 30 questions, 10 assessments
npm run dev     # Start on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm start       # Runs on http://localhost:3000, proxies API to backend
```

### 3. Seed Accounts

After running `npm run seed` in `server`:

| Role    | Email                 | Password   |
|---------|-----------------------|------------|
| Admin   | admin@cognitive.com   | admin123   |
| Teacher | teacher@cognitive.com | teacher123 |
| Student | student@cognitive.com | student123 |

## Project Structure

```
project 2/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # DashboardLayout, ProfileDropdown
│       ├── context/        # AuthContext
│       ├── pages/          # Home, Login, Register, StudentDashboard, etc.
│       └── api.js
├── server/                 # Express backend
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   │   └── seed.js
│   └── server.js
└── README.md
```

## API Overview

- `POST /api/auth/register` – Register
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Current user (auth)
- `GET/POST/PUT/DELETE /api/subjects` – Subjects (admin)
- `PUT /api/subjects/:id/assign-teachers` – Assign teachers (admin)
- `GET/POST/PUT/DELETE /api/questions` – Questions (teacher for assigned subjects)
- `GET /api/assessments` – List assessments
- `GET /api/assessments/:id/attempt` – Get assessment for attempt (student)
- `POST /api/results/submit` – Submit attempt (student)
- `GET /api/results/my-results` – My results (student)
- `GET /api/results/dashboard-stats` – Dashboard stats (student)

## License

MIT
