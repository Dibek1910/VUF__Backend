const { pool } = require("../config/db");

const Team = {
  findById: async (id) => {
    const result = await pool.query("SELECT * FROM teams WHERE id = $1", [id]);
    return result.rows[0];
  },

  create: async (teamData) => {
    const { name, captainId } = teamData;

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Create the team
      const teamResult = await client.query(
        "INSERT INTO teams (name, captain_id) VALUES ($1, $2) RETURNING *",
        [name, captainId]
      );

      const team = teamResult.rows[0];

      // Add captain as a player in the team
      await client.query(
        "INSERT INTO team_players (team_id, player_id) VALUES ($1, $2)",
        [team.id, captainId]
      );

      await client.query("COMMIT");
      return team;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
               'subscription_status', u.subscription_status,
               'subscription_expiry_date', u.subscription_expiry_date
             ) AS captain,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'email', p.email,
                   'phone', p.phone,
                   'role', p.role,
                   'unique_id', p.unique_id
                 )
               )
               FROM team_players tp
               JOIN users p ON tp.player_id = p.id
               WHERE tp.team_id = t.id), '[]'
             ) AS players
      FROM teams t
      JOIN users u ON t.captain_id = u.id
    `);
    return result.rows;
  },

  addPlayer: async (teamId, playerId) => {
    await pool.query(
      "INSERT INTO team_players (team_id, player_id) VALUES ($1, $2)",
      [teamId, playerId]
    );

    const result = await pool.query(
      `
      SELECT t.*, 
             json_build_object(
               'id', u.id,
               'name', u.name,
               'email', u.email,
               'phone', u.phone,
               'role', u.role,
               'unique_id', u.unique_id,
               'subscription_status', u.subscription_status,
               'subscription_expiry_date', u.subscription_expiry_date
             ) AS captain,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'email', p.email,
                   'phone', p.phone,
                   'role', p.role,
                   'unique_id', p.unique_id
                 )
               )
               FROM team_players tp
               JOIN users p ON tp.player_id = p.id
               WHERE tp.team_id = t.id), '[]'
             ) AS players
      FROM teams t
      JOIN users u ON t.captain_id = u.id
      WHERE t.id = $1
    `,
      [teamId]
    );

    return result.rows[0];
  },

  setRemovalRequested: async (teamId, playerId) => {
    const result = await pool.query(
      "UPDATE teams SET removal_requested = $1 WHERE id = $2 RETURNING *",
      [playerId, teamId]
    );
    return result.rows[0];
  },

  hasPlayer: async (teamId, playerId) => {
    const result = await pool.query(
      "SELECT 1 FROM team_players WHERE team_id = $1 AND player_id = $2",
      [teamId, playerId]
    );
    return result.rows.length > 0;
  },
};

module.exports = Team;
