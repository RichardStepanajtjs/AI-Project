const express = require("express");
const router = express.Router();
const {
  getAllCompaniesWithEmbeddings,
  getAllCompaniesWithoutEmbeddings,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} = require("../crud/companiesCrud");

// COMPANIES ROUTES

// GET all companies (with embeddings)
router.get("/embeddings", async (req, res) => {
  try {
    const companies = await getAllCompaniesWithEmbeddings();
    res.json({
      success: true,
      data: companies,
      count: companies.length,
    });
  } catch (error) {
    console.error("Error fetching companies for AI:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching companies for AI",
      error: error.message,
    });
  }
});

// Get all companies (wihtout embeddings)
router.get("/", async (req, res) => {
  try {
    const companies = await getAllCompaniesWithoutEmbeddings();
    res.json({
      success: true,
      data: companies,
      count: companies.length,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching companies",
      error: error.message,
    });
  }
});

// Get company by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const company = await getCompanyById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company",
      error: error.message,
    });
  }
});

// Create new company
router.post("/", async (req, res) => {
  try {
    // Basis validatie
    if (!req.body.naam || !req.body.kbonummer) {
      return res.status(400).json({
        success: false,
        message: "Naam and kbonummer are required",
      });
    }

    const company = await createCompany(req.body);

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error("Error creating company:", error);

    // Check voor uniek kbonummer
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Een bedrijf met dit KBO-nummer bestaat al",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating company",
      error: error.message,
    });
  }
});

// Update company
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const company = await updateCompany(id, req.body);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found or no fields to update",
      });
    }

    res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    console.error("Error updating company:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "KBO-nummer is al in gebruik door een ander bedrijf",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating company",
      error: error.message,
    });
  }
});

// Delete company
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const company = await deleteCompany(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: "Company deleted successfully",
      data: company,
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting company",
      error: error.message,
    });
  }
});

module.exports = router;
