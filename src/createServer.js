'use strict';
/* eslint-disable no-console */

const { Server } = require('node:http');
const fs = require('node:fs');
const { pipeline } = require('node:stream');

function createServer() {
  const server = new Server();

  server.on('request', async (req, res) => {
    const url = req.url;
    const method = req.method;

    if (method === 'GET' && url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      const file = fs.createReadStream('public/index.html');

      file.on('error', () => {
        res.statusCode = 404;
        res.end('No such file');
      });

      file.on('close', () => {
        console.log('connection close');
        file.destroy();
      });

      pipeline(file, res, (err) => {
        if (err) {
          res.end();
        }
      });
    } else if (method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const params = new URLSearchParams(body);

        const expense = {
          date: params.get('date'),
          title: params.get('title'),
          amount: params.get('amount'),
        };

        const jsonData = JSON.stringify(expense);

        fs.writeFileSync('db/expense.json', jsonData);

        res.end();
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  return server;
}

module.exports = {
  createServer,
};
