import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';

const db = new Database('birthday_v2.db');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const scores = db.prepare('SELECT * FROM bingo_scores ORDER BY score DESC, timestamp DESC LIMIT 10').all();
    res.status(200).json(scores);
  } else if (req.method === 'POST') {
    const { player_name, score } = req.body;
    if (!player_name || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const info = db.prepare('INSERT INTO bingo_scores (player_name, score) VALUES (?, ?)').run(player_name, score);
    const newScore = {
      id: info.lastInsertRowid,
      player_name,
      score,
      timestamp: new Date().toISOString()
    };
    res.status(200).json(newScore);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
