const express = require("express");
const router = express.Router();
const {
    getAllForums,
    getForumById,
    createForum,
    updateForum,
    deleteForum
} = require("../crud/forumsCrud");

// FORUMS ROUTES

// Get all forums
router.get("/", async (req, res) => {
    try {
        const forums = await getAllForums();
        res.json({
            success: true,
            data: forums,
            count: forums.length,
        });
    } catch (error) {
        console.error("Error fetching forums:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching forums",
            error: error.message,
        });
    }
});

// Get forum by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await getForumById(id);

        if (!forum) {
            return res.status(404).json({
                success: false,
                message: "Forum not found",
            });
        }

        res.json({
            success: true,
            data: forum,
        });
    } catch (error) {
        console.error("Error fetching forum:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching forum",
            error: error.message,
        });
    }
});

// Create new forum
router.post("/", async (req, res) => {
    try {
        const { partner_name } = req.body;

        if (!partner_name) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: partner_name",
            });
        }

        const newForum = await createForum(req.body);

        res.status(201).json({
            success: true,
            message: "Forum successfully created",
            data: newForum,
        });

    } catch (error) {
        console.error("Error creating forum:", error);
        res.status(500).json({
            success: false,
            message: "Error creating forum",
            error: error.message,
        });
    }
});

// Update forum
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await updateForum(id, req.body);

        if (!forum) {
            return res.status(404).json({
                success: false,
                message: "Forum not found or no fields to update",
            });
        }

        res.json({
            success: true,
            message: "Forum updated successfully",
            data: forum,
        });
    } catch (error) {
        console.error("Error updating forum:", error);
        res.status(500).json({
            success: false,
            message: "Error updating forum",
            error: error.message,
        });
    }
});

// Delete forum
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await deleteForum(id);

        if (!forum) {
            return res.status(404).json({
                success: false,
                message: "Forum not found",
            });
        }

        res.json({
            success: true,
            message: "Forum deleted successfully",
            data: forum,
        });
    } catch (error) {
        console.error("Error deleting forum:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting forum",
            error: error.message,
        });
    }
});

module.exports = router;