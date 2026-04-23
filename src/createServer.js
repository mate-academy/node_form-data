'use strict';

const { Server } = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const htmlPath = path.join(__dirname, 'index.html');

      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(htmlPath));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File html not found');
      }

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const expensePath = path.join(__dirname, '../', 'db', 'expense.json');

      let data = '';

      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          const parsedData = JSON.parse(data);

          if (!parsedData.date || !parsedData.title || !parsedData.amount) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid data format');

            return;
          }

          let expenseData = [];

          try {
            const fileData = fs.readFileSync(expensePath, 'utf-8');

            expenseData = JSON.parse(fileData);

            if (!Array.isArray(expenseData)) {
              expenseData = [];
            }
          } catch {
            expenseData = [];
          }

          expenseData.push(parsedData);

          fs.writeFileSync(expensePath, JSON.stringify(expenseData, null, 2));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(expenseData, null, 2));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Server error: ${err}`);
        }
      });

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
