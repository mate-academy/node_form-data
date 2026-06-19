/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method !== 'POST' || !req.url.includes('expense')) {
      res.statusCode = 404;
      res.end();

      return;
    }

    const chunks = [];
    const dataPath = path.resolve(__dirname, '../db/expense.json');

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const data = JSON.parse(Buffer.concat(chunks).toString());

      if (!data.date || !data.title || !data.amount) {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Wrong request data');

        return;
      }

      res.setHeader('Content-type', 'application/json');
      res.statusCode = 200;
      fs.writeFileSync(dataPath, JSON.stringify(data));

      res.end(JSON.stringify(data));
    });
  });
}

module.exports = {
  createServer,
};
