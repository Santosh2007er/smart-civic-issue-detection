const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (supports both /report and /report.html)
app.use(express.static(path.join(__dirname, '../frontend'), { extensions: ['html'] }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'AI-Powered Smart Civic Issue Detection',
    event: 'Designathon 2.0 2026',
    team: 'DYNAMIC TRIO',
    institution: 'Rajalakshmi Institute of Technology',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/detect', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  AI-POWERED SMART CIVIC ISSUE DETECTION - PROTOTYPE SERVER    `);
  console.log(`  Designathon 2.0 2026 | Rajalakshmi Institute of Technology     `);
  console.log(`  Team: DYNAMIC TRIO (Nisanthan S, Santosh G, Sooriya Vigneshwaran R)`);
  console.log(`  Supporting UN SDG 11: Sustainable Cities and Communities       `);
  console.log(`================================================================`);
  console.log(`  * Web Application:  http://localhost:${PORT}`);
  console.log(`  * API Base:         http://localhost:${PORT}/api`);
  console.log(`  * Citizen Portal:   http://localhost:${PORT}/report.html`);
  console.log(`  * Admin Dashboard:  http://localhost:${PORT}/dashboard.html`);
  console.log(`  * Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`================================================================`);
});

module.exports = app;
