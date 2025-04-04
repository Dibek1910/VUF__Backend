const express = require("express");
const router = express.Router();
const {
  createMatch,
  updateScore,
  getMatches,
  getMatchById,
  getMatchesByStatus,
  updateMatchStatus,
  updateMatch,
  deleteMatch,
} = require("../controllers/matchController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teams
 *               - status
 *             properties:
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Live, Completed]
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Match created successfully
 *       401:
 *         description: Not authorized
 */
router.post("/", protect, authorize("Admin"), createMatch);

/**
 * @swagger
 * /api/matches/score:
 *   put:
 *     summary: Update match score
 *     tags: [Matches]
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
 *               teamId:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Score updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Match not found
 */
router.put("/score", protect, authorize("Admin"), updateScore);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all matches
 *       401:
 *         description: Not authorized
 */
router.get("/", protect, getMatches);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Matches]
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
 *         description: Match details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Match not found
 */
router.get("/:id", protect, getMatchById);

/**
 * @swagger
 * /api/matches/status/{status}:
 *   get:
 *     summary: Get matches by status
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Upcoming, Live, Completed]
 *     responses:
 *       200:
 *         description: List of matches with the specified status
 *       401:
 *         description: Not authorized
 */
router.get("/status/:status", protect, getMatchesByStatus);

/**
 * @swagger
 * /api/matches/status:
 *   put:
 *     summary: Update match status
 *     tags: [Matches]
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
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Live, Completed]
 *     responses:
 *       200:
 *         description: Match status updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Match not found
 */
router.put("/status", protect, authorize("Admin"), updateMatchStatus);

/**
 * @swagger
 * /api/matches/{matchId}:
 *   put:
 *     summary: Update match details
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
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
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Live, Completed]
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Match updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Match not found
 */
router.put("/:matchId", protect, authorize("Admin"), updateMatch);

/**
 * @swagger
 * /api/matches/{matchId}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete match
 *       404:
 *         description: Match not found
 */
router.delete("/:matchId", protect, authorize("Admin"), deleteMatch);

module.exports = router;
