const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'project_h.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
    db.serialize(() => {
        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user',
            tier TEXT DEFAULT 'free',
            status TEXT DEFAULT 'pending',
            message_count INTEGER DEFAULT 0,
            last_reset TEXT DEFAULT (date('now'))
        )`);

        // Create Sessions Table (for chat history list)
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            title TEXT DEFAULT 'New Chat',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Create Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(session_id) REFERENCES sessions(id)
        )`);

        // Check if admin exists, if not create one
        const adminUser = 'admin';
        const adminPass = 'Zeq26TyB65Rt@b1';
        
        db.get("SELECT * FROM users WHERE username = ?", [adminUser], (err, row) => {
            if (!row) {
                const hashedPassword = bcrypt.hashSync(adminPass, 10);
                db.run("INSERT INTO users (username, password, role, tier, status) VALUES (?, ?, ?, ?, ?)", 
                    [adminUser, hashedPassword, 'admin', 'paid', 'active']);
                console.log("Admin account initialized: admin / Zeq26TyB65Rt@b1");
            }
        });
    });
};

module.exports = { db, initDb };
