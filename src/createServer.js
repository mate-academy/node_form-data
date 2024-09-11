/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/add-expense') {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      try {
        const data = JSON.parse(Buffer.concat(chunks).toString());

        if (Object.keys(data).length !== 3) {
          res.statusCode = 400;
          res.end('Invalid data');

          return;
        }

        const json = JSON.stringify(data, null, 2);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        fs.writeFileSync(path.resolve('db', 'expense.json'), json);
        res.end(json);
      } catch (err) {
        res.statusCode = 400;
        res.end(err);
      }

      return;
    }

    if (url.pathname === '/') {
      const fileStream = fs.createReadStream(path.resolve('src', 'index.html'));

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      fileStream.pipe(res);

      return;
    }

    res.statusCode = 404;
    res.end('Bad request');
  });

  return server;
}

module.exports = {
  createServer,
};
