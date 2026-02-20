const express = require("express");
const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :anakId
const remainderController = require("../controllers/reminderController");
const { authenticate } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/anak/:anakId/reminder
 * @desc    Get all reminders for a child
 * @access  Private
 */
router.get("/", remainderController.getByAnakId);

/**
 * @route   GET /api/anak/:anakId/reminder/:reminderId
 * @desc    Get single reminder
 * @access  Private
 */
router.get("/:reminderId", remainderController.getById);

/**
 * @route   POST /api/anak/:anakId/reminder
 * @desc    Create new reminder
 * @access  Private
 */
router.post("/", remainderController.create);

/**
 * @route   PUT /api/anak/:anakId/reminder/:reminderId
 * @desc    Update reminder
 * @access  Private
 */
router.put("/:reminderId", remainderController.update);

/**
 * @route   PATCH /api/anak/:anakId/reminder/:reminderId/toggle
 * @desc    Toggle reminder active status
 * @access  Private
 */
router.patch("/:reminderId/toggle", remainderController.toggleActive);

/**
 * @route   DELETE /api/anak/:anakId/reminder/:reminderId
 * @desc    Delete reminder
 * @access  Private
 */
router.delete("/:reminderId", remainderController.delete);

/**
 * @route   POST /api/anak/:anakId/reminder/default
 * @desc    Generate default reminders
 * @access  Private
 */
router.post("/default", remainderController.generateDefault);

module.exports = router;