'use strict';

/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const { createGzip } = require('zlib');
const formidable = require('formidable');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (
    (pathname === '/' || pathname === '/index.html')
    && req.method.toLowerCase() === 'get'
  ) {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Encoding': 'gzip',
    });

    const file = path.resolve('public', 'index.html');

    const gzip = createGzip();

    fs.createReadStream(file).pipe(gzip).pipe(res);

    res.on('error', (err) => {
      console.error('An error occurred:', err);
    });
  } else if (pathname === '/expense' && req.method.toLowerCase() === 'post') {
    const form = formidable({ multiples: true });

    form.parse(req, (err, fields) => {
      if (err) {
        console.error('An error occurred:', err);

        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });

        res.end('Server error');

        return;
      }

      const { amount, title, date } = fields;

      const expense = {
        amount,
        title,
        date,
      };

      fs.createWriteStream(path.resolve('data', 'expenses.json')).write(
        JSON.stringify(expense)
      );

      res.writeHead(200, {
        'Content-Type': 'application/json',
      });

      res.end(JSON.stringify(expense));
    });

    req.on('error', (err) => {
      console.error('An error occurred:', err);
    });
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/plain',
    });

    res.end('Not found');
  }
});

server.on('error', (err) => {
  console.error('An error occurred:', err);
});

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
