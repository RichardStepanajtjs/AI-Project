const express = require("express");
const router = express.Router();
const {
    getAllForms,
    getFormById,
    createForm,
    updateForm,
    deleteForm
} = require("../crud/formsCrud");

const { rankModel } = require("../crud/modelsCrud");

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

        res.status(201).json({
            success: true,
            message: "Form created successfully",
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

        // Trigger ranking na succesvolle verwerking
        try {
            console.log(`[Backend] Triggering ranking for form ${id}...`);
            const rankingResponse = await rankModel(parseInt(id), 20); // k=20 als default

            const matches = rankingResponse.matches;

            if (Array.isArray(matches)) {
                const company_ids = matches
                    .map(m => Number(m.id))
                    .filter(val => Number.isInteger(val));

                if (company_ids.length > 0) {
                    const formData = await getFormById(id);
                    
                    if (formData) {
                        await createProspectList({
                            user_id: formData.user_id || 1, 
                            // Verander dit naar naam gegeven bij het invullen van het form.
                            naam: formData.partner_name || `Form ${id}`, 
                            jobdomein: formData.sector || "Algemeen",
                            form_id: parseInt(id),
                            company_ids
                        });
                        console.log(`Prospectielijst '${formData.partner_name}' succesvol aangemaakt voor form ${id}`);
                    }
                } else {
                    console.warn(`Geen geldige company_ids gevonden in matches voor form ${id}`);
                }
            } else {
                console.warn(`Geen 'matches' array gevonden in ranking response voor form ${id}`);
            }
        } catch (rankError) {
            console.error("Ranking or Prospect List creation failed after processing:", rankError);
        }

        res.json({
            success: true,
            message: data.message || "Form succesvol verwerkt en gerankt",
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