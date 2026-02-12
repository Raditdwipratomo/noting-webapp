const express = require("express");
const router = express.Router({ mergeParams: true });
const giziController = require("../controllers/giziController");
const { authenticate } = require("../middleware/authMiddleware");


// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/anak/:anakId/gizi/rencana
 * @desc    Get current/active weekly nutrition plan
 * @access  Private
 */
router.get("/rencana", giziController.getCurrentRencana);

/**
 * @route   GET /api/anak/:anakId/gizi/rencana/history
 * @desc    Get nutrition plan history
 * @access  Private
 */
router.get("/rencana/history", giziController.getRencanaHistory);

/**
 * @route   POST /api/anak/:anakId/gizi/rencana/generate
 * @desc    Generate new weekly nutrition plan
 * @access  Private
 */
router.post("/rencana/generate", giziController.generateRencana);

/**
 * @route   POST /api/anak/:anakId/gizi/rencana/:rencanaId/complete
 * @desc    Mark weekly plan as completed
 * @access  Private
 */
router.post("/rencana/:rencanaId/complete", giziController.completeRencana);

/**
 * @route   GET /api/anak/:anakId/gizi/today
 * @desc    Get today's recommendation
 * @access  Private
 */
router.get("/today", giziController.getTodayRecommendation);

/**
 * @route   GET /api/anak/:anakId/gizi/progress
 * @desc    Get weekly progress
 * @access  Private
 */
router.get("/progress", giziController.getProgress);

/**
 * @route   GET /api/anak/:anakId/gizi/hari/:hariKe
 * @desc    Get daily recommendation
 * @access  Private
 */
router.get("/hari/:hariKe", giziController.getDailyRecommendation);

/**
 * @route   PATCH /api/anak/:anakId/gizi/makanan/:detailId
 * @desc    Update food consumption status
 * @access  Private
 */
router.patch("/makanan/:detailId", giziController.updateMakananStatus);

module.exports = router;
