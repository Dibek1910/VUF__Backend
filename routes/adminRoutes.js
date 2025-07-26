const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getPendingCaptains,
  approveCaptain,
  rejectCaptain,
  getAllTeams,
  getPendingRemovals,
  approvePlayerRemoval,
  rejectPlayerRemoval,
  getAllMatches,
  getAllUsers,
  deleteUser,
  deleteTeam,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *       401:
 *         description: Not authorized
 */
router.get("/dashboard", protect, authorize("Admin"), getAdminDashboard);

/**
 * @swagger
 * /api/admin/pending-captains:
 *   get:
 *     summary: Get all pending captain approvals
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
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Captain not found
 */
router.post("/approve-captain", protect, authorize("Admin"), approveCaptain);

/**
 * @swagger
 * /api/admin/reject-captain:
 *   post:
 *     summary: Reject a captain
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
 *         description: Captain rejected successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Captain not found
 */
router.post("/reject-captain", protect, authorize("Admin"), rejectCaptain);

/**
 * @swagger
 * /api/admin/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all teams
 *       401:
 *         description: Not authorized
 */
router.get("/teams", protect, authorize("Admin"), getAllTeams);

/**
 * @swagger
 * /api/admin/pending-removals:
 *   get:
 *     summary: Get pending player removal requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending removal requests
 *       401:
 *         description: Not authorized
 */
router.get(
  "/pending-removals",
  protect,
  authorize("Admin"),
  getPendingRemovals
);

/**
 * @swagger
 * /api/admin/approve-removal:
 *   post:
 *     summary: Approve player removal
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
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 */
router.post(
  "/approve-removal",
  protect,
  authorize("Admin"),
  approvePlayerRemoval
);

/**
 * @swagger
 * /api/admin/reject-removal:
 *   post:
 *     summary: Reject player removal
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
 *         description: Player removal rejected successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 */
router.post(
  "/reject-removal",
  protect,
  authorize("Admin"),
  rejectPlayerRemoval
);

/**
 * @swagger
 * /api/admin/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all matches
 *       401:
 *         description: Not authorized
 */
router.get("/matches", protect, authorize("Admin"), getAllMatches);

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
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete admin user
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.delete("/users/:userId", protect, authorize("Admin"), deleteUser);

/**
 * @swagger
 * /api/admin/teams/{teamId}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 */
router.delete("/teams/:teamId", protect, authorize("Admin"), deleteTeam);

module.exports = router;
