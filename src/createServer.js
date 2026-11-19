'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const DB_PATH = path.resolve(__dirname, '../db/expense.json');

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';

      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({});
        }
      } else {
        resolve(querystring.parse(body));
      }
    });
    req.on('error', reject);
  });
}

function createServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.end(`
<html>
  <body>
    <form method="POST" action="/add-expense">
      <label>Date: <input type="text" name="date" /></label><br />
      <label>Title: <input type="text" name="title" /></label><br />
      <label>Amount: <input type="text" name="amount" /></label><br />
      <button type="submit">Submit</button>
    </form>
  </body>
</html>
      `);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      try {
        const data = await parseBody(req);

        if (!data.date || !data.title || !data.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing required fields');

          return;
        }

        const expense = {
          date: data.date,
          title: data.title,
          amount: data.amount,
        };

        fs.writeFileSync(DB_PATH, JSON.stringify(expense));

        res.writeHead(200, { 'Content-Type': 'text/html' });

        res.end(`
<html>
  <body>
    <pre>${JSON.stringify(expense, null, 2)}</pre>
  </body>
</html>
        `);
      } catch {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};
