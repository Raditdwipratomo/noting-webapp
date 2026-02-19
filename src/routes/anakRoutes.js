const express = require("express");
const router = express.Router();
const anakController = require("../controllers/anakController");
const { authenticate } = require("../middleware/authMiddleware");

// Import nested routes
const pertumbuhanRoutes = require("./pertumbuhanRoutes");
const diagnosaRoutes = require("./diagnosaRoutes");
const giziRoutes = require("./giziRoutes");
// const reminderRoutes = require("./reminderRoutes");
const alergiRoutes = require("./alergiRoutes");
const reminderRoutes = require("./remainderRoutes");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/anak
 * @desc    Get all children for current user
 * @access  Private
 */
router.get("/", anakController.getAllAnak);

/**
 * @route   POST /api/anak
 * @desc    Create a new child with initial growth data
 * @access  Private
 */
router.post("/", anakController.createAnak);

/**
 * @route   GET /api/anak/:anakId
 * @desc    Get single child by ID
 * @access  Private
 */
router.get("/:anakId", anakController.getAnakByAnakId);

/**
 * @route   GET /api/anak/:anakId/dashboard
 * @desc    Get child dashboard summary
 * @access  Private
 */
// router.get("/:anakId/dashboard", anakController.getDashboard);

/**
 * @route   PUT /api/anak/:anakId
 * @desc    Update child data
 * @access  Private
 */
router.put("/:anakId", anakController.updateAnak);

/**
 * @route   DELETE /api/anak/:anakId
 * @desc    Delete child (use ?permanent=true for hard delete)
 * @access  Private
 */
router.delete("/:anakId", anakController.deleteAnak);

// ========================================
// Nested Routes
// ========================================

/**
 * Pertumbuhan (Growth Tracking) Routes
 * /api/anak/:anakId/pertumbuhan/*
 */
router.use("/:anakId/pertumbuhan", pertumbuhanRoutes);

/**
 * Diagnosa (Stunting Detection) Routes
 * /api/anak/:anakId/diagnosa/*
 */
router.use("/:anakId/diagnosa", diagnosaRoutes);

/**
 * Gizi (Nutrition Recommendation) Routes
 * /api/anak/:anakId/gizi/*
 */
router.use("/:anakId/gizi", giziRoutes);

/**
 * Reminder Routes
 * /api/anak/:anakId/reminder/*
 */
router.use("/:anakId/reminder", reminderRoutes);

/**
 * Alergi (Allergy Management) Routes
 * /api/anak/:anakId/alergi/*
 */
router.use("/:anakId/alergi", alergiRoutes);

module.exports = router;
