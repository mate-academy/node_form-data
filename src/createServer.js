'use strict';

/* eslint-disable no-console */
const { Server } = require('http');
const path = require('path');
const fs = require('fs');

// const querystring = require('querystring');

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const requestedPath = url.pathname.slice(1) || 'index.html';
    const realPath = path.join(__dirname, '..', 'public', requestedPath);
    const dataPath = path.resolve(__dirname, '..', 'db', 'expense.json');

    if (req.url === '/' && req.method === 'GET') {
      if (!fs.existsSync(realPath)) {
        res.statusCode = 404;
        res.end('Not Found');

        return;
      }

      fs.readFile(realPath, 'utf-8', (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end('error', err);

          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      });

      return;
    }

    if (req.url === '/add-expense' && req.method === 'POST') {
      let chunks = '';

      req.on('data', (chunk) => {
        chunks += chunk.toString();
      });

      req.on('end', () => {
        // content-type: application/x-www-form-urlencoded
        const parsedData = JSON.parse(chunks); // but have fail in browser

        // this one fail tests but in browser work good header
        // const parsedData = querystring.parse(chunks);

        if (!parsedData.date || !parsedData.title || !parsedData.amount) {
          res.statusCode = 400; // Bad Request
          res.end('Missing required fields');

          return;
        }

        fs.writeFile(dataPath, JSON.stringify(parsedData, null, 2), (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');

            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(parsedData, null, 2));
        });
      });

      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid url');
  });

  server.on('error', (err) => {
    console.log('error', err);
  });

  return server;
}

module.exports = {
  createServer,
};
