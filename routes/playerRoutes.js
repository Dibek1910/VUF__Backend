const express = require("express");
const router = express.Router();
const {
  getTeamInvitations,
  acceptTeamInvitation,
  declineTeamInvitation,
  getPlayerTeam,
  getPlayerMatches,
  getPlayerDashboard,
} = require("../controllers/playerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/player/invitations:
 *   get:
 *     summary: Get team invitations for the logged in player
 *     tags: [Player]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of team invitations
 *       401:
 *         description: Not authorized
 */
router.get("/invitations", protect, authorize("Player"), getTeamInvitations);

/**
 * @swagger
 * /api/player/accept-invitation:
 *   post:
 *     summary: Accept a team invitation
 *     tags: [Player]
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
 *         description: Team invitation accepted successfully
 *       400:
 *         description: Already part of a team or not invited
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 */
router.post(
  "/accept-invitation",
  protect,
  authorize("Player"),
  acceptTeamInvitation
);

/**
 * @swagger
 * /api/player/decline-invitation:
 *   post:
 *     summary: Decline a team invitation
 *     tags: [Player]
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
 *         description: Team invitation declined successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 */
router.post(
  "/decline-invitation",
  protect,
  authorize("Player"),
  declineTeamInvitation
);

/**
 * @swagger
 * /api/player/team:
 *   get:
 *     summary: Get player's current team
 *     tags: [Player]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Player's team details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Player is not part of any team
 */
router.get("/team", protect, authorize("Player"), getPlayerTeam);

/**
 * @swagger
 * /api/player/matches:
 *   get:
 *     summary: Get matches for player's team
 *     tags: [Player]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of team matches
 *       401:
 *         description: Not authorized
 */
router.get("/matches", protect, authorize("Player"), getPlayerMatches);

/**
 * @swagger
 * /api/player/dashboard:
 *   get:
 *     summary: Get player dashboard data
 *     tags: [Player]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Player dashboard data
 *       401:
 *         description: Not authorized
 */
router.get("/dashboard", protect, authorize("Player"), getPlayerDashboard);

module.exports = router;
