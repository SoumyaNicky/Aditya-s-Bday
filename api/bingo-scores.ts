import { NextApiRequest, NextApiResponse } from 'next';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM bingo_scores ORDER BY score DESC, timestamp DESC LIMIT 10');
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err });
    }
  } else if (req.method === 'POST') {
    const { player_name, score } = req.body;
    if (!player_name || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const insertQuery = `INSERT INTO bingo_scores (player_name, score) VALUES ($1, $2) RETURNING *`;
      const values = [player_name, score];
      const { rows } = await pool.query(insertQuery, values);
      res.status(200).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
