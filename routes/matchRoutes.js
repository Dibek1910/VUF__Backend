const express = require("express");
const router = express.Router();
const {
  createMatch,
  updateScore,
  getMatches,
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

module.exports = router;
