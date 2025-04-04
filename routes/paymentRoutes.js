const express = require("express");
const router = express.Router();
const {
  processPayment,
  getTransactions,
  getTransactionById,
  getCaptainTransactions,
  updateTransactionStatus,
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

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Payments]
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
 *         description: Transaction details
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to view this transaction
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", protect, getTransactionById);

/**
 * @swagger
 * /api/payments/captain/my-transactions:
 *   get:
 *     summary: Get transactions for the logged in captain
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of captain's transactions
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not a captain
 */
router.get(
  "/captain/my-transactions",
  protect,
  authorize("Captain"),
  getCaptainTransactions
);

/**
 * @swagger
 * /api/payments/status:
 *   put:
 *     summary: Update transaction status
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
 *               - transactionId
 *               - status
 *             properties:
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed, Failed]
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update transaction status
 */
router.put("/status", protect, authorize("Admin"), updateTransactionStatus);

module.exports = router;
