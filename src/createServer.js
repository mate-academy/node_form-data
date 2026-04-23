'use strict';

const http = require('http');
const fs = require('fs');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    if (req.method === 'POST') {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const text = Buffer.concat(chunks).toString();
      const data = JSON.parse(text);

      if (Object.keys(data).length !== 3) {
        res.statusCode = 400;
        res.end('Not all params');

        return null;
      }

      fs.writeFile('./db/expense.json', JSON.stringify(data), (error) => {
        if (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Server error');

          return null;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};
