const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// MARS — unified data directory (package root /data)
const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'tasks.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to SQLite database
const db = new Database(dbPath);

// Initialize schema
function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME,
      priority INTEGER DEFAULT 0
    )
  `);
}

// Ensure tables are created when db.js is loaded
initDB();

// DB Operations

function addTask(title) {
  const stmt = db.prepare('INSERT INTO tasks (title) VALUES (?)');
  const info = stmt.run(title);
  return info.lastInsertRowid;
}

function listTasks(all = false) {
  let query = 'SELECT * FROM tasks';
  if (!all) {
    query += " WHERE status = 'pending'";
  }
  const stmt = db.prepare(query);
  return stmt.all();
}

function getTask(id) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id);
}

function completeTask(id) {
  const stmt = db.prepare("UPDATE tasks SET status = 'done' WHERE id = ?");
  const info = stmt.run(id);
  return info.changes > 0;
}

function deleteTask(id) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

module.exports = {
  addTask,
  listTasks,
  getTask,
  completeTask,
  deleteTask
};
