require('dotenv').config({
  path: '../Env/db.env',
  override: true
});

const express = require('express');
const cors = require('cors');

// Import routes
const usersRoute = require('./routes/users');
const vacanciesRoute = require('./routes/vacancies');

// Initialize database connection
require('./db/connection');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Api routes
app.use('/api/users', usersRoute);
app.use('/api/vacancies', vacanciesRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Available endpoints:');
  console.log('  GET    /health');
  console.log('Users:')
  console.log('  GET    /api/users');
  console.log('  GET    /api/users/:id');
  console.log('  POST   /api/users');
  console.log('  PUT    /api/users/:id');
  console.log('  DELETE /api/users/:id');
  console.log('Vacanies:');
  console.log('  GET    /api/vacancies');
  console.log('  GET    /api/vacancies/:id');
  console.log('  POST   /api/vacancies');
  console.log('  PUT    /api/vacancies/:id');
  console.log('  DELETE /api/vacancies/:id');
});

module.exports = app;