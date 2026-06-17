const express = require("express");
const router = express.Router();
const {
    getAllKboCompanies,
    getKboCompanyByEnterpriseNumber,
    createKboCompany,
    bulkCreateKboCompanies,
    getKboCompaniesCount,
} = require("../crud/kboCompaniesCrud");


// GET count - used to check whether the KBO data has already been pushed.
router.get("/count", async (req, res) => {
    try {
        const count = await getKboCompaniesCount();
        res.json({ success: true, count });
    } catch (error) {
        console.error("Error counting kbo companies:", error);
        res.status(500).json({
            success: false,
            message: "Error counting kbo companies",
            error: error.message,
        });
    }
});

// POST bulk create kbo companies
router.post("/bulk", async (req, res) => {
    try {
        const { companies } = req.body;
        if (!Array.isArray(companies) || companies.length === 0) {
            return res.status(400).json({
                success: false,
                message: "companies array is required and must not be empty",
            });
        }
        const result = await bulkCreateKboCompanies(companies);
        res.status(201).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Error bulk creating kbo companies:", error);
        res.status(500).json({
            success: false,
            message: "Error bulk creating kbo companies",
            error: error.message,
        });
    }
});

// GET all kbo companies
router.get("/", async (req, res) => {
    try {
        const companies = await getAllKboCompanies();
        res.json({
            success: true,
            data: companies,
            count: companies.length,
        });
    } catch (error) {
        console.error("Error fetching kbo companies:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching kbo companies",
            error: error.message,
        });
    }
});

// GET kbo company by enterprise number
router.get("/:enterpriseNumber", async (req, res) => {
    try {
        const { enterpriseNumber } = req.params;
        const company = await getKboCompanyByEnterpriseNumber(enterpriseNumber);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "KBO company not found",
            });
        }
        res.json({
            success: true,
            data: company,
        });
    } catch (error) {
        console.error("Error fetching kbo company:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching kbo company",
            error: error.message,
        });
    }
});

// POST create single kbo company
router.post("/", async (req, res) => {
    try {
        if (!req.body.enterprise_number) {
            return res.status(400).json({
                success: false,
                message: "enterprise_number is required",
            });
        }
        const company = await createKboCompany(req.body);
        res.status(201).json({
            success: true,
            message: "KBO company created successfully",
            data: company,
        });
    } catch (error) {
        console.error("Error creating kbo company:", error);
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Een bedrijf met dit ondernemingsnummer bestaat al",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error creating kbo company",
            error: error.message,
        });
    }
});

module.exports = router;