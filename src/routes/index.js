const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./authRoutes");
const anakRoutes = require("./anakRoutes");

/**
 * API Routes Index
 * All routes are prefixed with /api
 */

// ========================================
// Auth Routes
// ========================================
/**
 * @prefix /api/auth
 * Endpoints:
 *   POST   /register        - User registration
 *   POST   /login           - User login
 *   POST   /refresh-token   - Refresh access token
 *   POST   /logout          - User logout
 *   GET    /profile         - Get user profile
 *   PUT    /profile         - Update user profile
 *   PUT    /change-password - Change password
 */
router.use("/auth", authRoutes);

// ========================================
// Anak Routes (with nested routes)
// ========================================
/**
 * @prefix /api/anak
 * Main Endpoints:
 *   GET    /              - Get all children
 *   POST   /              - Create child with initial growth data
 *   GET    /:anakId       - Get child by ID
 *   GET    /:anakId/dashboard - Get child dashboard
 *   PUT    /:anakId       - Update child
 *   DELETE /:anakId       - Delete child
 *
 * Nested - Pertumbuhan (Growth):
 *   GET    /:anakId/pertumbuhan             - Get all growth records
 *   GET    /:anakId/pertumbuhan/latest      - Get latest record
 *   GET    /:anakId/pertumbuhan/chart       - Get chart data
 *   GET    /:anakId/pertumbuhan/statistics  - Get statistics
 *   POST   /:anakId/pertumbuhan             - Create growth record
 *   PUT    /:anakId/pertumbuhan/:id         - Update record
 *   DELETE /:anakId/pertumbuhan/:id         - Delete record
 *
 * Nested - Diagnosa (Stunting Detection):
 *   GET    /:anakId/diagnosa         - Get diagnosa history
 *   GET    /:anakId/diagnosa/latest  - Get latest diagnosa
 *   GET    /:anakId/diagnosa/summary - Get diagnosa summary
 *   POST   /:anakId/diagnosa/analyze - Trigger analysis
 *
 * Nested - Gizi (Nutrition):
 *   GET    /:anakId/gizi/rencana          - Get current plan
 *   GET    /:anakId/gizi/rencana/history  - Get plan history
 *   POST   /:anakId/gizi/rencana/generate - Generate new plan
 *   POST   /:anakId/gizi/rencana/:id/complete - Mark complete
 *   GET    /:anakId/gizi/today            - Today's recommendation
 *   GET    /:anakId/gizi/progress         - Weekly progress
 *   GET    /:anakId/gizi/hari/:hariKe     - Daily recommendation
 *   PATCH  /:anakId/gizi/makanan/:id      - Update meal status
 *
 * Nested - Reminder:
 *   GET    /:anakId/reminder                - Get all reminders
 *   POST   /:anakId/reminder                - Create reminder
 *   POST   /:anakId/reminder/generate-defaults - Generate defaults
 *   GET    /:anakId/reminder/:id            - Get reminder
 *   PATCH  /:anakId/reminder/:id            - Update reminder
 *   POST   /:anakId/reminder/:id/toggle     - Toggle active
 *   DELETE /:anakId/reminder/:id            - Delete reminder
 *
 * Nested - Alergi (Allergy):
 *   GET    /:anakId/alergi         - Get all allergies
 *   GET    /:anakId/alergi/summary - Get summary
 *   POST   /:anakId/alergi         - Add allergy
 *   PATCH  /:anakId/alergi/:id     - Update allergy
 *   DELETE /:anakId/alergi/:id     - Delete allergy
 */
router.use("/anak", anakRoutes);

// ========================================
// Health Check (optional)
// ========================================
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
