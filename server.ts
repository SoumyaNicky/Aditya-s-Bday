import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;

  // Database setup - Fresh start for "30 Versions of You"
  const db = new Database("birthday_v2.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      friend_name TEXT NOT NULL,
      version_title TEXT NOT NULL,
      known_since INTEGER NOT NULL, -- Year
      image_url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      time_taken INTEGER NOT NULL, -- in seconds
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bingo_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Routes
  app.get("/api/versions", (req, res) => {
    // Sort by known_since year ascending
    const versions = db.prepare("SELECT * FROM versions ORDER BY known_since ASC, timestamp ASC").all();
    res.json(versions);
  });

  // image_url is now a blob storage URL, not base64
  app.post("/api/versions", (req, res) => {
    const { friend_name, version_title, known_since, image_url } = req.body;
    if (!friend_name || !version_title || !known_since) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const info = db.prepare(`
      INSERT INTO versions (friend_name, version_title, known_since, image_url) 
      VALUES (?, ?, ?, ?)
    `).run(friend_name, version_title, parseInt(known_since), image_url || null);
    const newVersion = { 
      id: info.lastInsertRowid, 
      friend_name, 
      version_title, 
      known_since: parseInt(known_since), 
      image_url, 
      timestamp: new Date().toISOString() 
    };
    io.emit("new_version", newVersion);
    res.json(newVersion);
  });

  app.get("/api/scores", (req, res) => {
    const scores = db.prepare("SELECT * FROM scores ORDER BY score DESC, time_taken ASC LIMIT 10").all();
    res.json(scores);
  });

  app.post("/api/scores", (req, res) => {
    const { player_name, score, time_taken } = req.body;
    if (!player_name || score === undefined || time_taken === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const info = db.prepare(`
      INSERT INTO scores (player_name, score, time_taken) 
      VALUES (?, ?, ?)
    `).run(player_name, score, time_taken);
    
    const newScore = {
      id: info.lastInsertRowid,
      player_name,
      score,
      time_taken,
      timestamp: new Date().toISOString()
    };
    
    io.emit("new_score", newScore);
    res.json(newScore);
  });

  app.get("/api/bingo-scores", (req, res) => {
    const scores = db.prepare("SELECT * FROM bingo_scores ORDER BY score DESC, timestamp DESC LIMIT 10").all();
    res.json(scores);
  });

  app.post("/api/bingo-scores", (req, res) => {
    const { player_name, score } = req.body;
    if (!player_name || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const info = db.prepare(`
      INSERT INTO bingo_scores (player_name, score) 
      VALUES (?, ?)
    `).run(player_name, score);
    
    const newScore = {
      id: info.lastInsertRowid,
      player_name,
      score,
      timestamp: new Date().toISOString()
    };
    
    io.emit("new_bingo_score", newScore);
    res.json(newScore);
  });

  app.delete("/api/versions", (req, res) => {
    console.log("DELETE /api/versions - Purging all versions");
    try {
      db.prepare("DELETE FROM versions").run();
      io.emit("versions_cleared");
      console.log("Purge successful");
      res.json({ success: true });
    } catch (err) {
      console.error("Purge failed on server:", err);
      res.status(500).json({ error: "Failed to purge database" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
