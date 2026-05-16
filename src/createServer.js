'use strict';

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

function createServer() {
  const server = http.createServer(async (req, res) => {
    function checkValidation(obj) {
      if (typeof obj.date !== 'string' || !obj.date.trim()) {
        throw new Error(`Field of date not correct: ${obj.date}`);
      }

      if (typeof obj.title !== 'string' || !obj.title.trim()) {
        throw new Error(`Field of title not correct: ${obj.title}`);
      }

      const number = +obj.amount;

      if (!Number.isFinite(number) || number <= 0) {
        throw new Error(`Field of amount not correct: ${number}`);
      }

      const date = new Date(obj.date);

      if (isNaN(date.getTime())) {
        throw new Error(`Field of date not correct: ${obj.date}`);
      }

      return true;
    }

    if (req.method === 'POST') {
      let rawBody = '';

      const contentType = req.headers['content-type'];

      req.on('data', (chunk) => {
        rawBody = rawBody + chunk;
      });

      req.on('end', () => {
        let data = null;

        const normalizedContentType = contentType.includes(';')
          ? contentType.split(';')[0]
          : contentType;

        if (normalizedContentType === 'application/json') {
          data = JSON.parse(rawBody);
        }

        if (normalizedContentType === 'application/x-www-form-urlencoded') {
          data = Object.fromEntries(new URLSearchParams(rawBody));
        }

        if (data === null) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(`Unsupported Content-Type: ${normalizedContentType}`);

          return;
        }

        try {
          checkValidation(data);
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'text/html' });

          res.end(
            `<pre>${err.message}</pre> <pre>${JSON.stringify(
              {
                invalid: data,
              },
              null,
              2,
            )}</pre>`,
          );

          return;
        }

        const folder = path.join(__dirname, '..', 'db');
        const filePath = path.join(folder, 'expense.json');

        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        res.writeHead(200, { 'Content-Type': 'text/html' });

        res.end(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
      });
    }

    if (req.method === 'GET') {
      const base = req.headers.host
        ? `http://${req.headers.host}`
        : 'http://localhost:5701';

      const normalizedUrl = new url.URL(req.url || '', base);
      const origin =
        path.basename(normalizedUrl.pathname.slice(1)) || 'index.html';

      const mimeType = mime.lookup(origin) || 'text/plain';

      const originPathName = path.join(__dirname, origin);

      const fsStream = fs.createReadStream(originPathName);

      fsStream.on('error', (err) => {
        res.writeHead(404, { 'Content-Type': mimeType });
        res.end(`Error reading file: ${String(err)}`);
      });

      fsStream.on('open', () => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fsStream.pipe(res);
      });
    }
  });

  return server;
}

module.exports = {
  createServer,
};
