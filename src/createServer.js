/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable no-useless-return */
/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.dirname(__dirname);
const saveDir = path.join(rootDir, 'db');
const saveFile = path.join(saveDir, 'expense.json');
const indexHTML = path.join(__dirname, '/index.html');

if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir);
}

function createServer() {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const parsedData = JSON.parse(body);
        const { date, title, amount } = parsedData;

        if (!date || !title || !amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Помилка: відсутні необхідні поля (date, title, amount)');

          return;
        }

        fs.writeFileSync(saveFile, JSON.stringify(parsedData, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(parsedData));
      });
    } else if (req.method === 'GET' && req.url === '/') {
      if (fs.existsSync(indexHTML)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexHTML).pipe(res);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
