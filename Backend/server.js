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
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Api routes
app.use('/users', usersRoute);
app.use('/vacancies', vacanciesRoute);

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
  console.log('Users:');
  console.log('  GET    /users');
  console.log('  POST   /users');
  console.log('  GET    /users/:id');
  console.log('  PUT    /users/:id');
  console.log('  DELETE /users/:id');
  console.log('  POST /users/login');

  console.log('Vacanies:');
  console.log('  GET    /vacancies');
  console.log('  GET    /vacancies/:id');
  console.log('  POST   /vacancies');
  console.log('  PUT    /vacancies/:id');
  console.log('  DELETE /vacancies/:id');
});

module.exports = app;