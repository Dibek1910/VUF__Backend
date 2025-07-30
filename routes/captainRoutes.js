const express = require("express");
const router = express.Router();
const {
  getCaptainDashboard,
  createTeam,
  invitePlayer,
  assignJerseyNumber,
  getCaptainMatches,
  updateTeamDetails,
} = require("../controllers/captainController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/captain/dashboard:
 *   get:
 *     summary: Get captain dashboard data
 *     tags: [Captain]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Captain dashboard data retrieved successfully
 *       403:
 *         description: Captain not approved yet
 *       500:
 *         description: Server error
 */
router.get("/dashboard", protect, authorize("Captain"), getCaptainDashboard);

/**
 * @swagger
 * /api/captain/create-team:
 *   post:
 *     summary: Create a new team (only for approved captains)
 *     tags: [Captain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Team name
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Captain already has a team
 *       403:
 *         description: Captain not approved yet
 *       500:
 *         description: Server error
 */
router.post("/create-team", protect, authorize("Captain"), createTeam);

/**
 * @swagger
 * /api/captain/invite-player:
 *   post:
 *     summary: Invite a player to the team
 *     tags: [Captain]
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
 *               - playerUniqueId
 *             properties:
 *               teamId:
 *                 type: string
 *               playerUniqueId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Player invitation sent successfully
 *       400:
 *         description: Player already in team or already invited
 *       404:
 *         description: Team or player not found
 *       500:
 *         description: Server error
 */
router.post("/invite-player", protect, authorize("Captain"), invitePlayer);

/**
 * @swagger
 * /api/captain/assign-jersey:
 *   post:
 *     summary: Assign jersey number to a player
 *     tags: [Captain]
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
 *               - playerId
 *               - jerseyNumber
 *             properties:
 *               teamId:
 *                 type: string
 *               playerId:
 *                 type: string
 *               jerseyNumber:
 *                 type: number
 *     responses:
 *       200:
 *         description: Jersey number assigned successfully
 *       400:
 *         description: Jersey number already taken or player not in team
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
router.post(
  "/assign-jersey",
  protect,
  authorize("Captain"),
  assignJerseyNumber
);

/**
 * @swagger
 * /api/captain/matches:
 *   get:
 *     summary: Get matches for captain's teams
 *     tags: [Captain]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Captain matches retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/matches", protect, authorize("Captain"), getCaptainMatches);

/**
 * @swagger
 * /api/captain/team/{teamId}:
 *   put:
 *     summary: Update team details
 *     tags: [Captain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team details updated successfully
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
router.put("/team/:teamId", protect, authorize("Captain"), updateTeamDetails);

module.exports = router;
