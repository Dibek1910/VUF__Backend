const express = require("express");
const router = express.Router();
const { approveCaptain } = require("../controllers/adminController");
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

module.exports = router;
