const express = require("express");
const router = express.Router();
const {
  getAllProspectLists,
  getProspectListById,
  getProspectListsByUserId,
  getProspectListsByDomain,
  createProspectList,
  updateProspectList,
  deleteProspectList,
} = require("../crud/prospectlistCrud");

// (GH-03) Lijst filteren - pak de domein van de url
router.get("/filter/:tag", async (req, res) => {
  try {
    const { tag } = req.params;
    const data = await getCompaniesByDomain(tag);
    
    res.json({ 
      success: true, 
      filter: tag,
      data 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const data = await getAllProspectLists();
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const data = await getProspectListsByUserId(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await getProspectListById(req.params.id);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "List not found" });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_id, naam, company_ids } = req.body;
    if (!user_id || !naam || !company_ids) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }
    const data = await createProspectList(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await updateProspectList(req.params.id, req.body);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Not found or no changes" });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await deleteProspectList(req.params.id);
    if (!data)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
