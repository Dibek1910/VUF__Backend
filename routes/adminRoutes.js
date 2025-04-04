const express = require("express");
const router = express.Router();
const {
  approveCaptain,
  getAllUsers,
  getPendingCaptains,
  approvePlayerRemoval,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/admin/approve-captain:
 *   post:
 *     summary: Approve a captain
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - captainId
 *             properties:
 *               captainId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Captain approved successfully
 *       400:
 *         description: Invalid captain ID
 *       401:
 *         description: Not authorized
 */
router.post("/approve-captain", protect, authorize("Admin"), approveCaptain);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Not authorized
 */
router.get("/users", protect, authorize("Admin"), getAllUsers);

/**
 * @swagger
 * /api/admin/pending-captains:
 *   get:
 *     summary: Get pending captains
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending captains
 *       401:
 *         description: Not authorized
 */
router.get(
  "/pending-captains",
  protect,
  authorize("Admin"),
  getPendingCaptains
);

/**
 * @swagger
 * /api/admin/approve-player-removal:
 *   post:
 *     summary: Approve player removal from a team
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Player removal approved successfully
 *       400:
 *         description: No removal requested
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 */
router.post(
  "/approve-player-removal",
  protect,
  authorize("Admin"),
  approvePlayerRemoval
);

/**
 * @swagger
 * /api/admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Not authorized
 */
router.get("/dashboard-stats", protect, authorize("Admin"), getDashboardStats);

module.exports = router;
