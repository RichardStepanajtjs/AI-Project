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
const formsRoute = require('./routes/forms');
const kboCompaniesRoute = require('./routes/kbocompanies');
const testDataRoute = require('./routes/testdata');

// Initialize database connection
require('./db/connection');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
// Increased for large payloads (KBO data + trained FAISS model with embeddings)
app.use(express.json({ limit: '100mb' }));

// Api routes
app.use('/users', usersRoute);
app.use('/vacancies', vacanciesRoute);
app.use('/companies', companiesRoute);
app.use('/prospect-lists', prospectListsRoute);
app.use('/models', modelsRoute);
app.use('/forms', formsRoute);
app.use('/kbo-companies', kboCompaniesRoute);
app.use('/testdata', testDataRoute);

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
  console.log('  GET    /companies/count');
  console.log('  POST   /companies');
  console.log('  PUT    /companies/:id');
  console.log('  DELETE /companies/:id');

  console.log('Models:');
  console.log('  GET    /models');
  console.log('  GET    /models/active');
  console.log('  GET    /models/:id');
  console.log('  POST   /models');
  console.log('  POST   /models/train');
  console.log('  PUT    /models/:id');
  console.log('  PATCH  /models/:id/activate');
  console.log('  DELETE /models/:id');

  console.log('Forms:');
  console.log('  GET    /forms');
  console.log('  GET    /forms/:id');
  console.log('  POST   /forms');
  console.log('  PUT    /forms/:id');
  console.log('  DELETE /forms/:id');

  console.log('Prospect Lists:');
  console.log('  GET    /prospect-lists');
  console.log('  GET    /prospect-lists/:id');
  console.log('  GET    /prospect-lists/user/:userId');
  console.log('  POST   /prospect-lists');
  console.log('  PUT    /prospect-lists/:id');
  console.log('  DELETE /prospect-lists/:id');

  console.log('Test Data:');
  console.log('  GET    /testdata');
  console.log('  GET    /testdata/:id');
  console.log('  POST   /testdata');
  console.log('  PUT    /testdata/:id');
  console.log('  DELETE /testdata/:id');
  
  console.log('KBO Companies:');
  console.log('  GET    /kbo-companies');
  console.log('  GET    /kbo-companies/count');
  console.log('  GET    /kbo-companies/:enterpriseNumber');
  console.log('  POST   /kbo-companies');
  console.log('  POST   /kbo-companies/bulk');
});

module.exports = app;