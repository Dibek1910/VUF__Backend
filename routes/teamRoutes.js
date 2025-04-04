const express = require("express");
const router = express.Router();
const {
  createTeam,
  invitePlayer,
  getTeams,
  getTeamById,
  getCaptainTeams,
  requestPlayerRemoval,
  updateTeam,
  deleteTeam,
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
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 */
router.get("/:id", protect, getTeamById);

/**
 * @swagger
 * /api/teams/captain/my-teams:
 *   get:
 *     summary: Get teams for the logged in captain
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of captain's teams
 *       401:
 *         description: Not authorized
 */
router.get("/captain/my-teams", protect, authorize("Captain"), getCaptainTeams);

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

/**
 * @swagger
 * /api/teams/{teamId}:
 *   put:
 *     summary: Update team details
 *     tags: [Teams]
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
 *               jerseyNumbers:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update team
 *       404:
 *         description: Team not found
 */
router.put("/:teamId", protect, updateTeam);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
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
 *       403:
 *         description: Not authorized to delete team
 *       404:
 *         description: Team not found
 */
router.delete("/:teamId", protect, deleteTeam);

module.exports = router;
