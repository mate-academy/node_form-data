/* eslint-disable no-console */
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createGzip } from 'zlib';
import formidable from 'formidable';

const PORT = process.env.PORT || 8080;

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
      console.error(err);
    });
  } else if (pathname === '/expense' && req.method.toLowerCase() === 'post') {
    const form = formidable({ multiples: true });

    form.parse(req, (err, fields) => {
      if (err) {
        console.error(err);

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
      console.error(err);
    });
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/plain',
    });

    res.end('Not found');
  }
});

server.on('error', (err) => {
  console.error(err);
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
