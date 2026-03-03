import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';

const db = new Database('birthday_v2.db');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const versions = db.prepare('SELECT * FROM versions ORDER BY known_since ASC, timestamp ASC').all();
    res.status(200).json(versions);
  } else if (req.method === 'POST') {
    const { friend_name, version_title, known_since, image_url } = req.body;
    if (!friend_name || !version_title || !known_since) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const info = db.prepare('INSERT INTO versions (friend_name, version_title, known_since, image_url) VALUES (?, ?, ?, ?)').run(friend_name, version_title, parseInt(known_since), image_url || null);
    const newVersion = {
      id: info.lastInsertRowid,
      friend_name,
      version_title,
      known_since: parseInt(known_since),
      image_url,
      timestamp: new Date().toISOString()
    };
    res.status(200).json(newVersion);
  } else if (req.method === 'DELETE') {
    db.prepare('DELETE FROM versions').run();
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
