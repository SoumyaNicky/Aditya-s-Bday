import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});


export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM versions ORDER BY known_since ASC, timestamp ASC');
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err });
    }
  } else if (req.method === 'POST') {
    const { friend_name, version_title, known_since, image_url } = req.body;
    if (!friend_name || !version_title || !known_since) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const insertQuery = `INSERT INTO versions (friend_name, version_title, known_since, image_url) VALUES ($1, $2, $3, $4) RETURNING *`;
      const values = [friend_name, version_title, parseInt(known_since), image_url || null];
      const { rows } = await pool.query(insertQuery, values);
      res.status(200).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err });
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM versions');
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
