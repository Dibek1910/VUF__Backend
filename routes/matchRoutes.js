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
 *               - team1Id
 *               - team2Id
 *             properties:
 *               team1Id:
 *                 type: string
 *               team2Id:
 *                 type: string
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
 *       400:
 *         description: Invalid input or cannot create match between same team
 *       401:
 *         description: Not authorized
 *       404:
 *         description: One or both teams not found
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
 *         description: Match not found or team not found in match
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   teams:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         captainId:
 *                           type: string
 *                   matchDate:
 *                     type: string
 *                     format: date-time
 *                   location:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [Upcoming, Live, Completed, Cancelled]
 *                   scores:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         teamId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                         score:
 *                           type: number
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
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       captainId:
 *                         type: string
 *                 matchDate:
 *                   type: string
 *                   format: date-time
 *                 location:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [Upcoming, Live, Completed, Cancelled]
 *                 scores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       teamId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       score:
 *                         type: number
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
 *           enum: [Upcoming, Live, Completed, Cancelled]
 *         description: Match status
 *     responses:
 *       200:
 *         description: List of matches with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   teams:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         captainId:
 *                           type: string
 *                   matchDate:
 *                     type: string
 *                     format: date-time
 *                   location:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [Upcoming, Live, Completed, Cancelled]
 *                   scores:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         teamId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                         score:
 *                           type: number
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
 *                 enum: [Upcoming, Live, Completed, Cancelled]
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
 *                 match:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     teams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           captainId:
 *                             type: string
 *                     status:
 *                       type: string
 *                       enum: [Upcoming, Live, Completed, Cancelled]
 *                     scores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           teamId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           score:
 *                             type: number
 *       400:
 *         description: Invalid status
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
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Live, Completed, Cancelled]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 match:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     teams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           captainId:
 *                             type: string
 *                     matchDate:
 *                       type: string
 *                       format: date-time
 *                     location:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Upcoming, Live, Completed, Cancelled]
 *                     scores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           teamId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           score:
 *                             type: number
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
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Match deleted successfully"
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete match
 *       404:
 *         description: Match not found
 */
router.delete("/:matchId", protect, authorize("Admin"), deleteMatch);

module.exports = router;
