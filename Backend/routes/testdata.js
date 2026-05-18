const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const {
  getAllTestData,
  getTestDataById,
  createTestData,
  updateTestData,
  deleteTestData
} = require('../crud/testdataCrud');

// TEST DATA ROUTES

// Get all test data
router.get('/', async (req, res) => {
    try {
        const testData = await getAllTestData();
        res.status(200).json({
            Success: true,
            data: testData,
            count: testData.length
        });
    } catch (error) {
        console.error('Error fetching test data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vacancies',
            error: error.message
        });
    }
});

// Get test data by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const model = await getTestDataById(id);

        if (!model) {
            return res.status(404).json({
                success: false,
                message: "Test data not found",
            });
        }

        res.json({
            success: true,
            data: model,
        });
    } catch (error) {
        console.error("Error fetching test data:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching test data",
            error: error.message,
        });
    }
});