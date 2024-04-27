'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    const url = new URL(req.url, `http:${req.headers.host}`);

    res.setHeader('Content-Type', 'text/plaint');

    if (url.pathname !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Not found');
    } else {
      const chunkList = [];

      for await (const chunk of req) {
        chunkList.push(chunk);
      }

      const fileContent = Buffer.concat(chunkList).toString();

      const { date, title, amount } = JSON.parse(fileContent);

      if (!date || !title || !amount) {
        res.statusCode = 400;

        return res.end('Invalid form');
      }

      const filePath = path.resolve(__dirname, '../db/expense.json');
      const fileStream = fs.createWriteStream(filePath);

      fileStream.write(fileContent, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end(String(err));
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(fileContent);
      });

      fileStream.end();
    }
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};
