const express = require("express");
const router = express.Router();
const {
    getAllForms,
    getFormById,
    createForm,
    updateForm,
    deleteForm
} = require("../crud/formsCrud");

// maak prospects via form aan
const { createProspectList } = require("../crud/prospectlistCrud");

const PYTHON_CONTAINER_URL = process.env.PYTHON_CONTAINER_URL || "http://python_container:5001";

// Forms ROUTES

// Get all forms
router.get("/", async (req, res) => {
    try {
        const forms = await getAllForms();
        res.json({
            success: true,
            data: forms,
            count: forms.length,
        });
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching forms",
            error: error.message,
        });
    }
});

// Get form by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const form = await getFormById(id);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "form not found",
            });
        }

        res.json({
            success: true,
            data: form,
        });
    } catch (error) {
        console.error("Error fetching form:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching form",
            error: error.message,
        });
    }
});

// Create new form
router.post("/", async (req, res) => {
    try {
        const { partner_name, sector } = req.body;

        if (!partner_name) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: partner_name",
            });
        }

        const newform = await createForm(req.body);

        await createProspectList({
            user_id: 1,
            form_id: newform.id,
            naam: partner_name,
            jobdomein: sector || 'Algemeen',
            company_ids: []
        });

        res.status(201).json({
            success: true,
            message: "Form saved and Prospect List created!",
            data: newform,
        });

    } catch (error) {
        console.error("Error creating form:", error);
        res.status(500).json({
            success: false,
            message: "Error creating form",
            error: error.message,
        });
    }
});

// Update form
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const form = await updateForm(id, req.body);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "form not found or no fields to update",
            });
        }

        res.json({
            success: true,
            message: "form updated successfully",
            data: form,
        });
    } catch (error) {
        console.error("Error updating form:", error);
        res.status(500).json({
            success: false,
            message: "Error updating form",
            error: error.message,
        });
    }
});

// Process form: genereer description + embedding via Python container
router.post("/:id/process", async (req, res) => {
    try {
        const { id } = req.params;

        const response = await fetch(`${PYTHON_CONTAINER_URL}/process-form`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ form_id: parseInt(id) }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(502).json({
                success: false,
                message: "Form verwerking mislukt",
                error: errData.message || `Python container status: ${response.status}`,
            });
        }

        const data = await response.json();
        res.json({
            success: true,
            message: data.message || "Form succesvol verwerkt",
        });
    } catch (error) {
        console.error("Error processing form:", error);
        res.status(500).json({
            success: false,
            message: "Error processing form",
            error: error.message,
        });
    }
});

// Delete form
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const form = await deleteForm(id);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "form not found",
            });
        }

        res.json({
            success: true,
            message: "form deleted successfully",
            data: form,
        });
    } catch (error) {
        console.error("Error deleting form:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting form",
            error: error.message,
        });
    }
});

module.exports = router;