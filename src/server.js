'use strict';

const http = require('http');
const { readFile, writeFile } = require('fs');
const { formidable } = require('formidable');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const resName = pathname === '/' ? '/index.html' : pathname;

  if (pathname !== '/add-expense') {
    readFile(`./static${resName}`, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end();
      } else {
        res.end(data);
      }
    });

    return;
  }

  if (req.method.toLowerCase() !== 'post') {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Server accepts only POST requests');

    return;
  }

  parseFormData(req, res);
});

const parseFormData = (req, res) => {
  const form = formidable({});

  form.parse(req, (err, fields) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end('Error while parsing form data');

      return;
    }

    writeFile('./expense.json', JSON.stringify(fields), (writeErr) => {
      if (writeErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error while writing JSON file');

        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(fields, null, 2));
    });
  });
};

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
