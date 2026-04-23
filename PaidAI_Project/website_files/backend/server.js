const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./database');

dotenv.config();
initDb();

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'project_h_secret_key_88';

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Helper to get latest config
const getConfig = () => {
    const configPath = path.join(__dirname, '../config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

/** AUTH MIDDLEWARE **/
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. Please login.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired session.' });
        req.user = user;
        next();
    });
};

/** AUTH ROUTES **/
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: 'Username already exists.' });
        res.json({ message: 'Registration successful!' });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role, tier: user.tier }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, tier: user.tier } });
    });
});

/** ADMIN ROUTES **/
app.get('/api/admin/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only access.' });
    db.all("SELECT id, username, role, tier, status, message_count FROM users WHERE role != 'admin'", [], (err, rows) => {
        res.json(rows);
    });
});

app.post('/api/admin/approve/:userId', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only access.' });
    db.run("UPDATE users SET tier = 'paid', status = 'active' WHERE id = ?", [req.params.userId], (err) => {
        res.json({ message: 'User upgraded to Paid Tier successfully!' });
    });
});

/** SESSION ROUTES **/
app.get('/api/sessions', authenticateToken, (req, res) => {
    db.all("SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch sessions' });
        res.json(rows);
    });
});

app.get('/api/sessions/:id', authenticateToken, (req, res) => {
    db.all("SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch messages' });
        res.json(rows);
    });
});

app.post('/api/sessions', authenticateToken, (req, res) => {
    const { title } = req.body;
    const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    db.run("INSERT INTO sessions (id, user_id, title) VALUES (?, ?, ?)", [sessionId, req.user.id, title || 'New Chat'], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to create session' });
        res.json({ id: sessionId, title: title || 'New Chat' });
    });
});

/** CHAT ENDPOINT (SECURED & PERSISTED) **/
app.post('/api/chat', authenticateToken, async (req, res) => {
    const { messages, sessionId } = req.body;
    const config = getConfig();

    db.get("SELECT * FROM users WHERE id = ?", [req.user.id], async (err, user) => {
        const today = new Date().toISOString().split('T')[0];
        let currentCount = user.message_count;

        if (user.last_reset !== today) {
            currentCount = 0;
            db.run("UPDATE users SET message_count = 0, last_reset = ? WHERE id = ?", [today, user.id]);
        }

        if (user.tier === 'free' && currentCount >= 10) {
            return res.status(429).json({ error: 'Daily limit reached', details: 'Free users are limited to 10 messages per day. Please upgrade for unlimited access.' });
        }

        try {
            let aiResponse = "";
            const lastUserMessage = messages[messages.length - 1].content;

            // Save user message to DB if sessionId exists
            if (sessionId) {
                db.run("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", [sessionId, 'user', lastUserMessage]);
            }

            if (config.aiProvider === 'groq' || config.aiProvider === 'openai') {
                const isGroq = config.aiProvider === 'groq';
                const aiClient = new OpenAI({
                    apiKey: isGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY,
                    baseURL: isGroq ? "https://api.groq.com/openai/v1" : undefined
                });
                const response = await aiClient.chat.completions.create({
                    model: config.model || (isGroq ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo"),
                    messages: messages,
                });
                aiResponse = response.choices[0].message.content;
            } else if (config.aiProvider === 'gemini') {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: config.model || "gemini-1.5-flash" }, { apiVersion: "v1" });
                const history = messages.slice(0, -1).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
                const firstUserIndex = history.findIndex(m => m.role === 'user');
                const chat = model.startChat({ history: firstUserIndex !== -1 ? history.slice(firstUserIndex) : [] });
                const result = await chat.sendMessage(lastUserMessage);
                const response = await result.response;
                aiResponse = response.text();
            }

            // Save assistant message to DB
            if (sessionId) {
                db.run("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", [sessionId, 'assistant', aiResponse]);
                
                // Update session title if it was 'New Chat' using the first few words
                db.get("SELECT title FROM sessions WHERE id = ?", [sessionId], (err, row) => {
                    if (row && row.title === 'New Chat') {
                        const newTitle = lastUserMessage.substring(0, 30) + (lastUserMessage.length > 30 ? '...' : '');
                        db.run("UPDATE sessions SET title = ? WHERE id = ?", [newTitle, sessionId]);
                    }
                });
            }

            db.run("UPDATE users SET message_count = ? WHERE id = ?", [currentCount + 1, user.id]);
            res.json({ message: aiResponse });

        } catch (error) {
            res.status(500).json({ error: 'AI Service Error', details: error.message });
        }
    });
});

app.get('/api/config', (req, res) => {
    res.sendFile(path.join(__dirname, '../config.json'));
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Project H Professional Unified Server running on port ${port}`);
});
