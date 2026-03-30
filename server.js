const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('trades.db');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('rodando...'));

// tabela
 db.run(`
CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  side TEXT,
  asset TEXT,
  entry REAL,
  exit REAL,
  contracts INTEGER,
  points REAL,
  result REAL,
  description TEXT,
  tag TEXT,
  created_at TEXT
)`);

// salvar
app.post('/trades', (req, res) => {
  const { asset, entry, exit, description, tag, contracts, side } = req.body;

  const points = side === 'buy' ? (exit - entry) : (entry - exit);
  const result = points * 10 * contracts;
  const created_at = new Date().toISOString();

  db.run(
    'INSERT INTO trades (asset, entry, exit, contracts, points, result, description, tag, created_at, side) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [asset, entry, exit, contracts, points, result, description, tag, created_at, side],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

// listar
app.get('/trades', (req, res) => {
  db.all('SELECT * FROM trades ORDER BY id DESC', [], (err, rows) => {
    res.json(rows);
  });
});

// deletar
app.delete('/trades/:id', (req, res) => {
  db.run('DELETE FROM trades WHERE id = ?', [req.params.id], () => {
    res.json({ ok: true });
  });
});

// editar
app.put('/trades/:id', (req, res) => {
  const { entry, exit, description, tag, contracts } = req.body;

  const points = side === 'buy' ? (exit - entry) : (entry - exit);
  const result = points * 10 * contracts;

  db.run(
    'UPDATE trades SET entry=?, exit=?, contracts=?, points=?, result=?, description=?, tag=?, side=? WHERE id=?',
    [entry, exit, contracts, points, result, description, tag, side, req.params.id],
    () => res.json({ ok: true })
  );
});


