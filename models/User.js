const { pool } = require("../config/db");

const User = {
  findById: async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  findByUniqueID: async (uniqueID) => {
    const result = await pool.query(
      "SELECT * FROM users WHERE unique_id = $1",
      [uniqueID]
    );
    return result.rows[0];
  },

  create: async (userData) => {
    const { name, email, phone, role, password, uniqueID } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, role, password, unique_id, subscription_status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Inactive') 
       RETURNING *`,
      [name, email, phone, role, password, uniqueID]
    );
    return result.rows[0];
  },

  updateSubscription: async (id, status, expiryDate) => {
    const result = await pool.query(
      `UPDATE users 
       SET subscription_status = $1, subscription_expiry_date = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, expiryDate, id]
    );
    return result.rows[0];
  },
};

module.exports = User;
