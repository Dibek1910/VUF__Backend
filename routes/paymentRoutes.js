const express = require("express");
const router = express.Router();
const {
  processPayment,
  getTransactions,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment
 *     tags: [Payments]
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
 *               - amount
 *             properties:
 *               captainId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Payment failed
 *       401:
 *         description: Not authorized
 */
router.post("/", protect, authorize("Captain"), processPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all transactions
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all transactions
 *       401:
 *         description: Not authorized
 */
router.get("/", protect, authorize("Admin"), getTransactions);

module.exports = router;
