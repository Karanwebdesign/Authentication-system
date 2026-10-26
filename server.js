const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "users.sqlite");

let db;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "change-this-session-secret-before-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60
  }
}));
app.use(express.static(path.join(__dirname, "public")));

function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function safeUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

function findUserByEmail(email) {
  const statement = db.prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?");
  statement.bind([email]);
  let result = null;
  if (statement.step()) result = statement.getAsObject();
  statement.free();
  return result;
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Please log in to access this resource." });
  }
  next();
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (name.length > 80) {
      return res.status(400).json({ message: "Name must be 80 characters or fewer." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    if (findUserByEmail(email)) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    db.run("INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)", [
      name, email, passwordHash, new Date().toISOString()
    ]);
    saveDatabase();

    const user = findUserByEmail(email);
    req.session.user = safeUser(user);
    return res.status(201).json({ message: "Registration successful.", user: req.session.user });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ message: "Could not start a secure session." });
      req.session.user = safeUser(user);
      return res.json({ message: "Login successful.", user: req.session.user });
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

app.get("/api/auth/me", (req, res) => {
  if (!req.session.user) return res.status(200).json({ authenticated: false, user: null });
  res.json({ authenticated: true, user: req.session.user });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Could not log out. Please try again." });
    res.clearCookie("connect.sid", { httpOnly: true, sameSite: "lax" });
    res.json({ message: "Logged out successfully." });
  });
});

app.get("/api/protected", requireAuth, (req, res) => {
  res.json({
    message: "You have accessed a protected route.",
    user: req.session.user,
    data: ["Account overview", "Private dashboard", "Member-only content"]
  });
});

async function start() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const bytes = fs.readFileSync(DB_PATH);
    db = new SQL.Database(bytes);
  } else {
    db = new SQL.Database();
  }
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);
  saveDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Authentication System running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Could not start server:", error);
  process.exit(1);
});
