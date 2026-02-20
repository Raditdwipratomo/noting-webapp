const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router({ mergeParams: true });
const alergiController = require("../controllers/alergiController");

router.use(authenticate);

/**
 * @route   GET /api/anak/:anakId/alergi
 * @desc    Get all allergies for a child
 * @access  Private
 */
router.get("/", alergiController.getAll);

/**
 * @route   GET /api/anak/:anakId/alergi/summary
 * @desc    Get allergy summary
 * @access  Private
 */
router.get("/summary", alergiController.getSummary);

/**
 * @route   POST /api/anak/:anakId/alergi
 * @desc    Add allergy for a child
 * @access  Private
 */
router.post("/", alergiController.create);

/**
 * @route   PATCH /api/anak/:anakId/alergi/:alergiId
 * @desc    Update allergy record
 * @access  Private
 */
router.patch("/:alergiId", alergiController.update);

/**
 * @route   DELETE /api/anak/:anakId/alergi/:alergiId
 * @desc    Delete allergy record
 * @access  Private
 */
router.delete("/:alergiId", alergiController.delete);

module.exports = router;
