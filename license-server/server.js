const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_uuid TEXT UNIQUE NOT NULL,
      device_name TEXT,
      status TEXT DEFAULT 'active',
      last_check DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Endpoint: Check License
app.post('/api/check', (req, res) => {
  const { device_uuid, device_name } = req.body;

  if (!device_uuid) {
    return res.status(400).json({ error: 'device_uuid is required' });
  }

  const selectSql = `SELECT status FROM devices WHERE device_uuid = ?`;
  db.get(selectSql, [device_uuid], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      // Device exists, update last_check
      const updateSql = `UPDATE devices SET last_check = CURRENT_TIMESTAMP WHERE device_uuid = ?`;
      db.run(updateSql, [device_uuid], (err) => {
        if (err) console.error('Error updating last_check', err.message);
      });
      return res.json({ status: row.status });
    } else {
      // New device, insert as active
      const insertSql = `INSERT INTO devices (device_uuid, device_name, status) VALUES (?, ?, 'active')`;
      db.run(insertSql, [device_uuid, device_name || 'Unknown Device'], function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Failed to register device' });
        }
        return res.json({ status: 'active' });
      });
    }
  });
});

// Endpoint: Get All Devices (Admin)
app.get('/api/devices', (req, res) => {
  const sql = `SELECT * FROM devices ORDER BY last_check DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Endpoint: Toggle Ban (Admin)
app.post('/api/devices/toggle-ban', (req, res) => {
  const { device_uuid, status } = req.body;

  if (!device_uuid || !status) {
    return res.status(400).json({ error: 'device_uuid and status are required' });
  }

  if (status !== 'active' && status !== 'banned') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const sql = `UPDATE devices SET status = ? WHERE device_uuid = ?`;
  db.run(sql, [status, device_uuid], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ success: true, status });
  });
});

app.listen(PORT, () => {
  console.log(`License server running on http://localhost:${PORT}`);
});
