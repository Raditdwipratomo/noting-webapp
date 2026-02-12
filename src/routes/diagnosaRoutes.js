const express = require("express");
const router = express.Router({ mergeParams: true });
const diagnosaController = require("../controllers/diagnosaController");
const { authenticate } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/anak/:anakId/diagnosa
 * @desc    Get diagnosa history
 * @access  Private
 */
router.get("/", diagnosaController.getRiwayat);

/**
 * @route   GET /api/anak/:anakId/diagnosa/latest
 * @desc    Get latest diagnosa
 * @access  Private
 */
router.get("/latest", diagnosaController.getLatest);

/**
 * @route   GET /api/anak/:anakId/diagnosa/summary
 * @desc    Get diagnosa summary/statistics
 * @access  Private
 */
router.get("/summary", diagnosaController.getSummary);

/**
 * @route   POST /api/anak/:anakId/diagnosa/analyze
 * @desc    Trigger manual stunting analysis
 * @access  Private
 */
router.post("/analyze", diagnosaController.analyze);

module.exports = router;
