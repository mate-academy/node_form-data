'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../db/expense.json');

function ensureDbDir() {
  const dir = path.dirname(DB_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function initDb() {
  ensureDbDir();

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf8');
  }
}

function saveExpense(expense) {
  ensureDbDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(expense, null, 2), 'utf8');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString());
    });

    req.on('error', reject);
  });
}

function parseExpense(req, body) {
  const contentType = req.headers['content-type'] || '';

  // JSON requests
  if (contentType.startsWith('application/json')) {
    return JSON.parse(body);
  }

  // Form-urlencoded requests
  const params = new URLSearchParams(body);
  const expense = {};

  for (const [key, value] of params.entries()) {
    expense[key] = value;
  }

  return expense;
}

function getFormHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Expense Tracker</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,300&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #f5f0e8; --paper: #fdfaf4; --ink: #1a1208; --muted: #7a6e5f;
      --accent: #c84b2f; --accent-light: #f5e8e4; --border: #d6cfc3;
    }
    body {
      background: var(--bg); color: var(--ink);
      font-family: 'DM Mono', monospace;
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; padding: 2rem;
    }
    .card {
      background: var(--paper); border: 1px solid var(--border);
      border-radius: 2px; padding: 3rem; width: 100%; max-width: 480px;
      box-shadow: 0 4px 16px rgba(26,18,8,.08), 6px 6px 0 var(--border);
      position: relative;
    }
    .card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0;
      height: 3px; background: var(--accent);
    }
    .label-tag {
      font-size: .65rem; letter-spacing: .15em; text-transform: uppercase;
      color: var(--accent); margin-bottom: .5rem;
    }
    h1 { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 700; }
    h1 em { font-style: italic; font-weight: 300; color: var(--muted); }
    .header { margin-bottom: 2.5rem; }
    .field { margin-bottom: 1.5rem; }
    label {
      display: block; font-size: .7rem; letter-spacing: .1em;
      text-transform: uppercase; color: var(--muted); margin-bottom: .5rem;
    }
    input {
      width: 100%; padding: .75rem 1rem; background: var(--bg);
      border: 1px solid var(--border); border-radius: 1px;
      font-family: 'DM Mono', monospace; font-size: .9rem; color: var(--ink);
      outline: none; transition: border-color .15s, box-shadow .15s;
    }
    input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .amount-wrap { position: relative; }
    .amount-wrap::before {
      content: '€'; position: absolute; left: 1rem; top: 50%;
      transform: translateY(-50%); color: var(--muted); pointer-events: none;
    }
    .amount-wrap input { padding-left: 2rem; }
    button[type="submit"] {
      width: 100%; padding: .9rem; margin-top: .5rem;
      background: var(--ink); color: var(--bg); border: none;
      font-family: 'DM Mono', monospace; font-size: .75rem;
      letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
      transition: background .15s;
    }
    button[type="submit"]:hover { background: var(--accent); }
    .footer-note { margin-top: 1.5rem; font-size: .68rem; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="label-tag">// record</p>
      <h1>New <em>Expense</em></h1>
    </div>
    <form method="POST" action="/add-expense">
      <div class="field">
        <label for="date">Date</label>
        <input type="date" id="date" name="date" required
          value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="field">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" placeholder="e.g. Team lunch" required autocomplete="off" />
      </div>
      <div class="field">
        <label for="amount">Amount</label>
        <div class="amount-wrap">
          <input type="number" id="amount" name="amount" placeholder="0.00" step="0.01" min="0" required />
        </div>
      </div>
      <button type="submit">Save Expense →</button>
    </form>
    <p class="footer-note">saved to db/expense.json</p>
  </div>
</body>
</html>`;
}

function getSuccessHtml(expense) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Expense Saved</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,300&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0e1117; --paper: #161b22; --ink: #e6edf3; --muted: #7d8590;
      --accent: #3fb950; --accent-dim: #1a3a22; --key: #79c0ff;
      --str: #a5d6ff; --num: #ffa657; --border: #30363d;
    }
    body {
      background: var(--bg); color: var(--ink);
      font-family: 'DM Mono', monospace; min-height: 100vh;
      display: flex; align-items: center; justify-content: center; padding: 2rem;
    }
    .card {
      background: var(--paper); border: 1px solid var(--border);
      border-radius: 6px; width: 100%; max-width: 520px; overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
      animation: slide-up .35s cubic-bezier(.16,1,.3,1) both;
    }
    @keyframes slide-up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    .top-bar {
      display: flex; align-items: center; gap: .5rem;
      padding: .75rem 1rem; background: #1c2128; border-bottom: 1px solid var(--border);
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot-red { background: #ff5f57; } .dot-amber { background: #ffbd2e; } .dot-green { background: var(--accent); }
    .filename { margin-left: .5rem; font-size: .72rem; color: var(--muted); }
    .success-banner {
      display: flex; align-items: center; gap: .75rem;
      padding: 1rem 1.5rem; background: var(--accent-dim); border-bottom: 1px solid #2d5a36;
    }
    .check {
      width: 20px; height: 20px; background: var(--accent); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: .7rem; color: #0e1117;
    }
    .success-text { font-size: .75rem; color: var(--accent); }
    .json-block pre {
  padding: 1.5rem;
  font-size: .85rem;
  line-height: 1.8;
  white-space: pre;
  overflow-x: auto;
}
    .key { color: var(--key); } .str { color: var(--str); } .num { color: var(--num); }
    .actions { display: flex; gap: .75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--border); }
    a {
      flex: 1; display: block; text-align: center; padding: .65rem;
      text-decoration: none; font-size: .72rem; letter-spacing: .1em;
      text-transform: uppercase; border-radius: 4px; transition: background .15s;
    }
    .btn-primary { background: var(--accent); color: #0e1117; font-weight: 500; }
    .btn-primary:hover { background: #56d364; }
    .btn-ghost { border: 1px solid var(--border); color: var(--muted); }
    .btn-ghost:hover { background: #21262d; color: var(--ink); }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-amber"></span>
      <span class="dot dot-green"></span>
      <span class="filename">db/expense.json</span>
    </div>
    <div class="success-banner">
      <div class="check">✓</div>
      <span class="success-text">Expense saved successfully</span>
    </div>
    <div class="json-block">
      <pre>${JSON.stringify(expense, null, 2)}</pre>
    </div>
    <div class="actions">
      <a href="/" class="btn-primary">+ Add Another</a>
      <a href="/expense" class="btn-ghost">View Raw JSON</a>
    </div>
  </div>
</body>
</html>`;
}

function createServer() {
  initDb();

  return http.createServer(async (req, res) => {
    const { method, url } = req;

    // GET / — show the form
    if (method === 'GET' && url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getFormHtml());

      return;
    }

    // GET /expense — serve raw JSON file
    if (method === 'GET' && url === '/expense') {
      ensureDbDir();

      if (!fs.existsSync(DB_PATH)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No expense recorded yet.' }));

        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(fs.readFileSync(DB_PATH, 'utf8'));

      return;
    }

    // POST /add-expense — receive data
    // (JSON or form-encoded), save, return HTML
    if (method === 'POST' && url === '/add-expense') {
      try {
        const body = await parseBody(req);
        const expense = parseExpense(req, body);

        if (!expense.date || !expense.title || !expense.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Bad Request: date, title, and amount are all required.');

          return;
        }

        // expense.amount = parseFloat(expense.amount);
        saveExpense(expense);

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getSuccessHtml(expense));
      } catch (err) {
        // console.error('Error handling POST:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }

      return;
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

module.exports = { createServer };
