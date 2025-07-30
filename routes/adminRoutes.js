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
const {
  createMatch,
  updateScore,
  updateMatchStatus,
} = require("../controllers/matchController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminDashboard:
 *       type: object
 *       properties:
 *         statistics:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: number
 *             totalCaptains:
 *               type: number
 *             totalPlayers:
 *               type: number
 *             pendingCaptains:
 *               type: number
 *             totalTeams:
 *               type: number
 *             totalMatches:
 *               type: number
 *             liveMatches:
 *               type: number
 *             upcomingMatches:
 *               type: number
 *             completedMatches:
 *               type: number
 *             pendingRemovals:
 *               type: number
 *         recentActivities:
 *           type: object
 *           properties:
 *             recentUsers:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             recentMatches:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *
 *     PendingCaptain:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         uniqueId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         isApproved:
 *           type: boolean
 *           default: false
 *
 *     TeamWithDetails:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         captainId:
 *           $ref: '#/components/schemas/User'
 *         players:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         removalRequested:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PendingRemoval:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         captainId:
 *           $ref: '#/components/schemas/User'
 *         removalRequested:
 *           $ref: '#/components/schemas/User'
 *         players:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         uniqueId:
 *           type: string
 *         role:
 *           type: string
 *           enum: [Admin, Captain, Player]
 *         isApproved:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Match:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         teams:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TeamWithDetails'
 *         matchDate:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Upcoming, Live, Completed, Cancelled]
 *         scores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               teamId:
 *                 $ref: '#/components/schemas/TeamWithDetails'
 *               score:
 *                 type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics and recent activities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminDashboard'
 *       401:
 *         description: Not authorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized"
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized to access this route"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
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
 *         description: List of pending captains retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PendingCaptain'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server error
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
 *     summary: Approve a captain registration
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
 *                 description: The ID of the captain to approve
 *                 example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Captain approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Captain approved successfully"
 *                 captain:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid captain ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Captain not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Captain not found"
 *       500:
 *         description: Server error
 */
router.post("/approve-captain", protect, authorize("Admin"), approveCaptain);

/**
 * @swagger
 * /api/admin/reject-captain:
 *   post:
 *     summary: Reject a captain registration (deletes the user)
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
 *                 description: The ID of the captain to reject
 *                 example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Captain rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Captain rejected successfully"
 *       400:
 *         description: Bad request - Invalid captain ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Captain not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Captain not found"
 *       500:
 *         description: Server error
 */
router.post("/reject-captain", protect, authorize("Admin"), rejectCaptain);

/**
 * @swagger
 * /api/admin/teams:
 *   get:
 *     summary: Get all teams with detailed information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamWithDetails'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server error
 */
router.get("/teams", protect, authorize("Admin"), getAllTeams);

/**
 * @swagger
 * /api/admin/teams/{teamId}:
 *   delete:
 *     summary: Delete a team and remove it from all matches
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to delete
 *         example: "60d5ecb74b24a1234567890b"
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team deleted successfully"
 *       400:
 *         description: Bad request - Invalid team ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team not found"
 *       500:
 *         description: Server error
 */
router.delete("/teams/:teamId", protect, authorize("Admin"), deleteTeam);

/**
 * @swagger
 * /api/admin/pending-removals:
 *   get:
 *     summary: Get all pending player removal requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending removal requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PendingRemoval'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server error
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
 *     summary: Approve a player removal request
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
 *                 description: The ID of the team with pending removal request
 *                 example: "60d5ecb74b24a1234567890b"
 *     responses:
 *       200:
 *         description: Player removal approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Player removal approved successfully"
 *                 team:
 *                   $ref: '#/components/schemas/TeamWithDetails'
 *       400:
 *         description: Bad request - Invalid team ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Team or removal request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team or removal request not found"
 *       500:
 *         description: Server error
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
 *     summary: Reject a player removal request
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
 *                 description: The ID of the team with pending removal request
 *                 example: "60d5ecb74b24a1234567890b"
 *     responses:
 *       200:
 *         description: Player removal rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Player removal rejected successfully"
 *                 team:
 *                   $ref: '#/components/schemas/TeamWithDetails'
 *       400:
 *         description: Bad request - Invalid team ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team not found"
 *       500:
 *         description: Server error
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
 *     summary: Get all matches with detailed information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new match
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
 *               - team1Id
 *               - team2Id
 *             properties:
 *               team1Id:
 *                 type: string
 *                 description: ID of the first team
 *                 example: "60d5ecb74b24a1234567890b"
 *               team2Id:
 *                 type: string
 *                 description: ID of the second team
 *                 example: "60d5ecb74b24a1234567890c"
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the match
 *                 example: "2024-02-15T14:30:00.000Z"
 *               location:
 *                 type: string
 *                 description: Location where the match will be played
 *                 example: "Cricket Ground A"
 *               description:
 *                 type: string
 *                 description: Additional details about the match
 *                 example: "League match between Team A and Team B"
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Match created successfully"
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Bad request - Invalid input or cannot create match between same team
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: One or both teams not found
 *       500:
 *         description: Server error
 */
router.get("/matches", protect, authorize("Admin"), getAllMatches);
router.post("/matches", protect, authorize("Admin"), createMatch);

/**
 * @swagger
 * /api/admin/update-score:
 *   post:
 *     summary: Update match score for a specific team
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
 *               - matchId
 *               - teamId
 *               - score
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: ID of the match to update
 *                 example: "60d5ecb74b24a1234567890d"
 *               teamId:
 *                 type: string
 *                 description: ID of the team whose score to update
 *                 example: "60d5ecb74b24a1234567890b"
 *               score:
 *                 type: number
 *                 description: New score for the team
 *                 example: 150
 *     responses:
 *       200:
 *         description: Match score updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Match score updated successfully"
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Match not found or team not found in match
 *       500:
 *         description: Server error
 */
router.post("/update-score", protect, authorize("Admin"), updateScore);

/**
 * @swagger
 * /api/admin/update-status:
 *   post:
 *     summary: Update match status
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
 *               - matchId
 *               - status
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: ID of the match to update
 *                 example: "60d5ecb74b24a1234567890d"
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Live, Completed, Cancelled]
 *                 description: New status for the match
 *                 example: "Live"
 *     responses:
 *       200:
 *         description: Match status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Match status updated successfully"
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Bad request - Invalid status
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
router.post("/update-status", protect, authorize("Admin"), updateMatchStatus);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users in the system
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server error
 */
router.get("/users", protect, authorize("Admin"), getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user from the system
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Bad request - Cannot delete admin user or invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cannot delete admin user"
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 */
router.delete("/users/:userId", protect, authorize("Admin"), deleteUser);

module.exports = router;
