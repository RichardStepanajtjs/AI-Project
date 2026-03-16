const express = require('express');
const router = express.Router();
const {
  getAllVacancies,
  getVacancyById,
  createVacancy,
  updateVacancy,
  deleteVacancy
} = require('../crud/vacanciesCrud');

// VACANCIES ROUTES

// Get all vacancies
router.get('/', async (req, res) => {
  try {
    const vacancies = await getAllVacancies();
    res.json({
      success: true,
      data: vacancies,
      count: vacancies.length
    });
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vacancies',
      error: error.message
    });
  }
});

// Get vacancy by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await getVacancyById(id);
    
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found'
      });
    }
    
    res.json({
      success: true,
      data: vacancy
    });
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vacancy',
      error: error.message
    });
  }
});

// Create new vacancy
router.post('/', async (req, res) => {
  try {
    if (!req.body.vacatureReferentie?.interneReferentie) {
      return res.status(400).json({
        success: false,
        message: 'vacatureReferentie.interneReferentie is required'
      });
    }
    
    const vacancy = await createVacancy(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Vacancy created successfully',
      data: vacancy
    });
  } catch (error) {
    console.error('Error creating vacancy:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'interne_referentie already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating vacancy',
      error: error.message
    });
  }
});

// Update vacancy
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await updateVacancy(id, req.body);
    
    res.json({
      success: true,
      message: 'Vacancy updated successfully',
      data: vacancy
    });
  } catch (error) {
    console.error('Error updating vacancy:', error);
    
    if (error.message === 'Vacancy not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'No fields to update') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating vacancy',
      error: error.message
    });
  }
});

// Delete vacancy
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await deleteVacancy(id);
    
    res.json({
      success: true,
      message: 'Vacancy deleted successfully',
      data: vacancy
    });
  } catch (error) {
    console.error('Error deleting vacancy:', error);
    
    if (error.message === 'Vacancy not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting vacancy',
      error: error.message
    });
  }
});

module.exports = router;
