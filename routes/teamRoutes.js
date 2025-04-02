const express = require("express");
const router = express.Router();
const {
  createTeam,
  invitePlayer,
  getTeams,
  requestPlayerRemoval,
} = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
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
 *               - captainId
 *             properties:
 *               name:
 *                 type: string
 *               captainId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 *       401:
 *         description: Not authorized
 */
router.post("/", protect, authorize("Captain"), createTeam);

/**
 * @swagger
 * /api/teams/invite:
 *   post:
 *     summary: Invite a player to a team
 *     tags: [Teams]
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
 *         description: Player invited successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team or player not found
 */
router.post("/invite", protect, authorize("Captain"), invitePlayer);

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all teams
 *       401:
 *         description: Not authorized
 */
router.get("/", protect, getTeams);

/**
 * @swagger
 * /api/teams/remove-player:
 *   post:
 *     summary: Request player removal from a team
 *     tags: [Teams]
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
 *             properties:
 *               teamId:
 *                 type: string
 *               playerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Player removal requested successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to remove player
 *       404:
 *         description: Team or player not found
 */
router.post(
  "/remove-player",
  protect,
  authorize("Captain"),
  requestPlayerRemoval
);

module.exports = router;
