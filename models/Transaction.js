const { pool } = require("../config/db");

const Transaction = {
  create: async (transactionData) => {
    const { captain, amount, status } = transactionData;

    const result = await pool.query(
      `INSERT INTO transactions (captain_id, amount, status) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [captain, amount, status]
    );

    return result.rows[0];
  },

  findAll: async () => {
    const result = await pool.query(`
      SELECT t.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'email', u.email,
               'phone', u.phone,
               'role', u.role,
               'unique_id', u.unique_id,
               'subscription_status', u.subscription_status
             ) AS captain
      FROM transactions t
      JOIN users u ON t.captain_id = u.id
    `);
    return result.rows;
  },
};

module.exports = Transaction;
