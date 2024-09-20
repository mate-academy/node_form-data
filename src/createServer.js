'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

const expFile = path.join(__dirname, '../db', 'expense.json');
const indexFile = path.join(__dirname, 'index.html');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/' && req.method === 'GET') {
      fs.readFile(indexFile, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server Error 1');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else if (pathname === '/add-expense' && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let form;

        try {
          form = JSON.parse(body);
        } catch {
          form = parse(body);
        }

        const { date, title, amount } = form;

        if (!date || !title || !amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing required fields');

          return;
        }

        const exp = { date, title, amount };

        fs.readFile(expFile, 'utf8', (err, data) => {
          let expenses = [];

          if (err && err.code === 'ENOENT') {
            expenses = [];
          } else if (!err) {
            try {
              const parsedData = JSON.parse(data);

              if (Array.isArray(parsedData)) {
                expenses = parsedData;
              } else {
                expenses = [];
              }
            } catch (parseError) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Invalid JSON format');

              return;
            }
          }

          expenses.push(exp);

          fs.writeFile(expFile, JSON.stringify(exp, null, 2), (error) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Server error 3');

              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(exp, null, 2));
          });
        });
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Not Found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
