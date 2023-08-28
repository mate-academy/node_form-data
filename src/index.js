/* eslint-disable no-console */

'use strict';

const http = require('http');

const fs = require('fs');

const path = require('path');

const formidable = require('formidable');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.url === '/favicon.ico') {
    return;
  }

  if (req.url === '/form') {
    const form = formidable();

    form.parse(req, (error, fields) => {
      if (error) {
        res.writeHead(error.httpCode || 400, { 'Content-Type': 'text/plain' });

        res.end(String(error));

        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });

      const filePath = path.join(__dirname, 'file.json');

      fs.writeFile(filePath, JSON.stringify(fields), (err) => {
        if (err) {
          res.status(404).end('File can not be created')

          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });

        res.end(`

        <html>

          <head>

            <title>HTML page</title>

          </head>

            <body>

              <h1>The best HTML page</h1>

              <pre>${JSON.stringify(fields, null, 2)}</pre>

              <br>

              <a href="/">Go back</a>

            </body>

        </html>

      `);
      });
    });
  } else {
    const url = new URL(req.url, `http://${req.headers.host}`);

    const fileName = url.pathname.slice(1) || 'index.html';

    const filePath = path.resolve('src', fileName);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;

      res.end('File does not exist');

      return;
    }

    const file = fs.createReadStream(filePath);

    file.pipe(res);

    file.on('error', () => {
      res.end('Error file not found');
    });
  }
});

server.on('error', () => {});

server.listen(PORT, () => {
  console.log(`server started on PORT:${PORT}`);
});
