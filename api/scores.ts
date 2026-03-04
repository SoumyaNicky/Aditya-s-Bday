import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

// ensure that the table exists before handling requests
async function ensureTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS scores (
       id SERIAL PRIMARY KEY,
       player_name TEXT NOT NULL,
       score INTEGER NOT NULL,
       time_taken INTEGER NOT NULL,
       timestamp TIMESTAMPTZ DEFAULT NOW()
     )`
  );
}

export default async function handler(req: any, res: any) {
  await ensureTable();

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM scores ORDER BY time_taken ASC, timestamp ASC LIMIT 10'
      );
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err });
    }
  } else if (req.method === 'POST') {
    const { player_name, score, time_taken } = req.body;
    if (!player_name || score === undefined || time_taken === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const insertQuery = `INSERT INTO scores (player_name, score, time_taken) VALUES ($1, $2, $3) RETURNING *`;
      const values = [player_name, score, time_taken];
      const { rows } = await pool.query(insertQuery, values);
      res.status(200).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
