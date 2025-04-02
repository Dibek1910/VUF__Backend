const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

const initializeDatabase = async () => {
  try {
    const sqlFile = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    await pool.query(sql);
    console.log("Database schema initialized successfully");
  } catch (err) {
    console.error("Error initializing database schema:", err);
    process.exit(1);
  }
};

module.exports = initializeDatabase;
