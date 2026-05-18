const express = require("express");
const router = express.Router();
const {
    getAllModels,
    getActiveModel,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
    setModelActive,
    trainModel
} = require("../crud/modelsCrud");

// MODELS ROUTES

// Get all models
router.get("/", async (req, res) => {
    try {
        const models = await getAllModels();
        res.status(200).json({
            success: true,
            data: models,
            count: models.length,
        });
    } catch (error) {
        console.error("Error fetching models:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching models",
            error: error.message,
        });
    }
});

// Get active model
router.get("/active", async (req, res) => {
    try {
        const model = await getActiveModel();
        
        if (!model) {
            return res.status(404).json({
                success: false,
                message: "No active model found",
            });
        }

        res.json({
            success: true,
            data: model,
        });
    } catch (error) {
        console.error("Error fetching active model:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching active model",
            error: error.message,
        });
    }
});

// Get model by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const model = await getModelById(id);

        if (!model) {
            return res.status(404).json({
                success: false,
                message: "Model not found",
            });
        }

        res.json({
            success: true,
            data: model,
        });
    } catch (error) {
        console.error("Error fetching model:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching model",
            error: error.message,
        });
    }
});

// Create new model
router.post("/", async (req, res) => {
  try {
    const { version_label, faiss_index, metadata_pkl } = req.body;

    if (!version_label || !faiss_index || !metadata_pkl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: version_label, faiss_index, or metadata_pkl",
      });
    }

    const newModel = await createModel(req.body);

    res.status(201).json({
      success: true,
      message: "Model successfully saved to database",
      data: newModel,
    });

  } catch (error) {
    console.error("Error creating model:", error);
    res.status(500).json({
      success: false,
      message: "Error creating model",
      error: error.message,
    });
  }
});

// Update model
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const model = await updateModel(id, data);

        if (!model) {
            return res.status(404).json({
                success: false,
                message: "Model not found",
            });
        }

        res.json({
            success: true,
            message: "Model updated successfully",
            data: model,
        });
    } catch (error) {
        console.error("Error updating model:", error);
        res.status(500).json({
            success: false,
            message: "Error updating model",
            error: error.message,
        });
    }
});

// Delete model
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const model = await deleteModel(id);

        if (!model) {
            return res.status(404).json({
                success: false,
                message: "Model not found",
            });
        }

        res.json({
            success: true,
            message: "Model deleted successfully",
            data: model,
        });
    } catch (error) {
        console.error("Error deleting model:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting model",
            error: error.message,
        });
    }
});

// Set model as active
router.patch("/:id/activate", async (req, res) => {
    try {
        const { id } = req.params;
        const model = await setModelActive(id);

        if (!model) {
            return res.status(404).json({
                success: false,
                message: "Model not found",
            });
        }

        res.json({
            success: true,
            message: "Model activated successfully",
            data: model,
        });
    } catch (error) {
        console.error("Error activating model:", error);
        res.status(500).json({
            success: false,
            message: "Error activating model",
            error: error.message,
        });
    }
});

router.post("/train", async (req, res) => {
    try {
        trainModel()
            .then(() => console.log("Training finished in the background"))
            .catch((err) => console.error("Error during training:", err));

        res.status(202).json({
            success: true,
            message: "Training process started successfully in the background",
        });
    } catch (error) {
        console.error("Error starting training:", error);
        res.status(500).json({
            success: false,
            message: "Error starting training",
            error: error.message,
        });
    }
});

module.exports = router;
