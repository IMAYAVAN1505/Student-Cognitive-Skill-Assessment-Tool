import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import api from '../api';
import './StudentDashboard.css';

const PRIMARY = '#4f46e5';
const SKILL_COLORS = {
  'Memory Skills': '#6366f1',
  'Attention & Focus': '#0ea5e9',
  'Logical Reasoning': '#10b981',
  'Problem Solving': '#f59e0b',
  'Verbal Ability': '#ec4899',
  'Numerical Ability': '#8b5cf6',
  'Analytical Thinking': '#06b6d4',
  'Critical Thinking': '#ef4444',
  'Decision Making': '#84cc16',
  'Pattern Recognition': '#f97316',
};

const TrendTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="trend-tooltip">
        <p className="tooltip-date">{data.date}</p>
        <div className="tooltip-content">
          <p className="tooltip-subject">{data.subject}</p>
          <p className="tooltip-score">Score : {data.percentage}%</p>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={Object.values(SKILL_COLORS)[index % 10]}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="700"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/results/dashboard-stats'),
      api.get('/assessments'),
    ])
      .then(([statsRes, assessRes]) => {
        setStats(statsRes.data);
        setAssessments(assessRes.data.slice(0, 5));
      })
      .catch(() => setStats({ skillSummary: {}, trendData: [], recentResults: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;

  const trendData = stats?.trendData || [];
  const recentResults = stats?.recentResults || [];

  // Pie chart data: results count, average score, and share percentage per subject
  const totalResults = recentResults.length;
  const subjectDistribution = totalResults ? Object.entries(
    recentResults.reduce((acc, r) => {
      const name = r.subject?.name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { count: 0, totalScore: 0 };
      }
      acc[name].count += 1;
      acc[name].totalScore += r.percentage;
      return acc;
    }, {})
  ).map(([name, data]) => ({
    name,
    value: data.count,
    avgScore: Math.round(data.totalScore / data.count),
    sharePercentage: Math.round((data.count / totalResults) * 100)
  })) : [];

  const avgScore = recentResults.length
    ? Math.round(recentResults.reduce((acc, r) => acc + r.percentage, 0) / recentResults.length)
    : 0;

  const upcoming = assessments[0];

  return (
    <div className="student-dashboard">
      <header className="welcome-header">
        <h1 className="dashboard-title">Welcome back!</h1>
        <p className="dashboard-subtitle">Here's your cognitive performance overview.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-card color-1">
          <span className="stat-label">Average Score</span>
          <div className="stat-value">
            {recentResults.length
              ? Math.round(recentResults.reduce((acc, r) => acc + r.percentage, 0) / recentResults.length)
              : 0}%
          </div>
          <div className="stat-trend trend-up">
            ↑ 4.2% from last month
          </div>
        </div>
        <div className="stat-card glass-card color-2">
          <span className="stat-label">Tests Completed</span>
          <div className="stat-value">{recentResults.length}</div>
          <div className="stat-trend">
            Steady progress
          </div>
        </div>
        <div className="stat-card glass-card color-3">
          <span className="stat-label">Main Skill</span>
          <div className="stat-value" style={{ fontSize: '1.5rem', paddingTop: '10px' }}>
            {subjectDistribution.length ? subjectDistribution.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <section className="chart-card glass-card">
          <h2>Performance trend</h2>
          <div className="chart-wrap">
            {trendData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Bar
                    dataKey="percentage"
                    fill={PRIMARY}
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">Complete assessments to see your trend.</div>
            )}
          </div>
        </section>


        <section className="chart-card glass-card">
          <h2>Activity Distribution</h2>
          <div className="chart-wrap pie-chart-container">
            {subjectDistribution.length ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(SKILL_COLORS)[index % 10]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.95)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="chart-empty">No activities to show.</div>
            )}
          </div>
        </section>
      </div>

      <section className="recent-results glass-card">
        <h2>Recent Performance</h2>
        {recentResults.length ? (
          <>
            <div className="results-table-header">
              <span>Subject</span>
              <span>Assessment</span>
              <span>Score</span>
              <span style={{ textAlign: 'right' }}>Date</span>
            </div>
            <ul className="results-list">
              {recentResults.map((r) => (
                <li key={r._id} className="result-item">
                  <span className="result-subject">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIMARY }}></span>
                    {r.subject?.name}
                  </span>
                  <span className="result-title">{r.assessment?.title}</span>
                  <span className="result-score">{r.percentage}%</span>
                  <span className="result-date">{new Date(r.completedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="no-results">No results yet. Take an assessment to see your scores here.</p>
        )}
      </section>
    </div>
  );
}
