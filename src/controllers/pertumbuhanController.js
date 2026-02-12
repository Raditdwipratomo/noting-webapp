const express = require("express");
const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :anakId
const pertumbuhanController = require("../controllers/pertumbuhanController");
const { authenticate } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/anak/:anakId/pertumbuhan
 * @desc    Get all growth records for a child
 * @access  Private
 */
router.get("/", pertumbuhanController.getAll);

/**
 * @route   GET /api/anak/:anakId/pertumbuhan/latest
 * @desc    Get latest growth record
 * @access  Private
 */
router.get("/latest", pertumbuhanController.getLatest);

/**
 * @route   GET /api/anak/:anakId/pertumbuhan/chart
 * @desc    Get chart data for growth visualization
 * @access  Private
 */
router.get("/chart", pertumbuhanController.getChartData);

/**
 * @route   GET /api/anak/:anakId/pertumbuhan/statistics
 * @desc    Get growth statistics
 * @access  Private
 */
router.get("/statistics", pertumbuhanController.getStatistics);

/**
 * @route   GET /api/anak/:anakId/pertumbuhan/:pertumbuhanId
 * @desc    Get single growth record
 * @access  Private
 */
router.get("/:pertumbuhanId", pertumbuhanController.getById);

/**
 * @route   POST /api/anak/:anakId/pertumbuhan
 * @desc    Create new growth record
 * @access  Private
 */
router.post("/", pertumbuhanController.create);

/**
 * @route   PUT /api/anak/:anakId/pertumbuhan/:pertumbuhanId
 * @desc    Update growth record
 * @access  Private
 */
router.put("/:pertumbuhanId", pertumbuhanController.update);

/**
 * @route   DELETE /api/anak/:anakId/pertumbuhan/:pertumbuhanId
 * @desc    Delete growth record
 * @access  Private
 */
router.delete("/:pertumbuhanId", pertumbuhanController.delete);

module.exports = router;
