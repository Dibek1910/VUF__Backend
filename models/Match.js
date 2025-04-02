const { pool } = require("../config/db");

const Match = {
  create: async (matchData) => {
    const { teams, status } = matchData;

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Create the match
      const matchResult = await client.query(
        "INSERT INTO matches (status) VALUES ($1) RETURNING *",
        [status]
      );

      const match = matchResult.rows[0];

      // Add teams to the match
      for (const teamId of teams) {
        await client.query(
          "INSERT INTO match_teams (match_id, team_id) VALUES ($1, $2)",
          [match.id, teamId]
        );

        // Initialize scores to 0
        await client.query(
          "INSERT INTO match_scores (match_id, team_id, score) VALUES ($1, $2, 0)",
          [match.id, teamId]
        );
      }

      await client.query("COMMIT");

      // Return the match with teams and scores
      const result = await client.query(
        `
        SELECT m.*,
               COALESCE(
                 (SELECT json_agg(t.*)
                  FROM match_teams mt
                  JOIN teams t ON mt.team_id = t.id
                  WHERE mt.match_id = m.id), '[]'
               ) AS teams,
               COALESCE(
                 (SELECT json_object_agg(team_id, score)
                  FROM match_scores
                  WHERE match_id = m.id), '{}'
               ) AS score
        FROM matches m
        WHERE m.id = $1
      `,
        [match.id]
      );

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  updateScore: async (matchId, teamId, score) => {
    await pool.query(
      "UPDATE match_scores SET score = $1 WHERE match_id = $2 AND team_id = $3",
      [score, matchId, teamId]
    );

    const result = await pool.query(
      `
      SELECT m.*,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', t.id,
                   'name', t.name,
                   'captain_id', t.captain_id
                 )
               )
                FROM match_teams mt
                JOIN teams t ON mt.team_id = t.id
                WHERE mt.match_id = m.id), '[]'
             ) AS teams,
             COALESCE(
               (SELECT json_object_agg(team_id::text, score)
                FROM match_scores
                WHERE match_id = m.id), '{}'
             ) AS score
      FROM matches m
      WHERE m.id = $1
    `,
      [matchId]
    );

    return result.rows[0];
  },

  findAll: async () => {
    const result = await pool.query(`
      SELECT m.*,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', t.id,
                   'name', t.name,
                   'captain_id', t.captain_id
                 )
               )
                FROM match_teams mt
                JOIN teams t ON mt.team_id = t.id
                WHERE mt.match_id = m.id), '[]'
             ) AS teams,
             COALESCE(
               (SELECT json_object_agg(team_id::text, score)
                FROM match_scores
                WHERE match_id = m.id), '{}'
             ) AS score
      FROM matches m
    `);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      `
      SELECT m.*,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', t.id,
                   'name', t.name,
                   'captain_id', t.captain_id
                 )
               )
                FROM match_teams mt
                JOIN teams t ON mt.team_id = t.id
                WHERE mt.match_id = m.id), '[]'
             ) AS teams,
             COALESCE(
               (SELECT json_object_agg(team_id::text, score)
                FROM match_scores
                WHERE match_id = m.id), '{}'
             ) AS score
      FROM matches m
      WHERE m.id = $1
    `,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Match;
