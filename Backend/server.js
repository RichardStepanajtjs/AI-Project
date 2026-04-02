require('dotenv').config({
  path: '../Env/db.env',
  override: true
});

const express = require('express');
const cors = require('cors');

// Import routes
const usersRoute = require('./routes/users');
const vacanciesRoute = require('./routes/vacancies');
const companiesRoute = require('./routes/companies');
const prospectListsRoute = require('./routes/prospectlists');
const modelsRoute = require('./routes/models');
const forumsRoute = require('./routes/forums');

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
app.use('/companies', companiesRoute);
app.use('/prospects', prospectListsRoute);
app.use('/models', modelsRoute);
app.use('/forums', forumsRoute);

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

  console.log('Companies:');
  console.log('  GET    /companies');
  console.log('  GET    /companies/:id');
  console.log('  POST   /companies');
  console.log('  PUT    /companies/:id');
  console.log('  DELETE /companies/:id');

  console.log('Models:');
  console.log('  GET    /models');
  console.log('  GET    /models/active');
  console.log('  GET    /models/:id');
  console.log('  POST   /models');
  console.log('  PUT    /models/:id');
  console.log('  PATCH  /models/:id/activate');
  console.log('  DELETE /models/:id');

  console.log('Forums:');
  console.log('  GET    /forums');
  console.log('  GET    /forums/:id');
  console.log('  POST   /forums');
  console.log('  PUT    /forums/:id');
  console.log('  DELETE /forums/:id');
});

module.exports = app;