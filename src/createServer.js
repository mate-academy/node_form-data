'use strict';

const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');
const formidable = require('formidable');
const zlib = require('zlib');
const mime = require('mime-types');
const path = require('path');

const EXPENSES_FILE = 'db/expense.json';

function createServer() {
  const server = http.createServer();

  server.on('request', (req, res) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const requestedPath = url.pathname.slice(1) || 'index.html';

    if (req.method === 'GET') {
      if (requestedPath === 'add-expense') {
        res.writeHead(400, {
          'Content-type': 'text/plain',
        });

        return res.end('GET method not allowed for add-expense');
      }

      const filePath = path.resolve(`public/${requestedPath}`);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, {
          'Content-type': 'text/plain',
        });

        return res.end('Not found');
      }

      const mimeType =
        mime.contentType(path.extname(filePath)) || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Encoding': 'gzip',
      });

      const flStream = fs.createReadStream(filePath);

      pipeline(flStream, zlib.createGzip(), res, (error) => {
        if (error) {
          res.writeHead(500, {
            'Content-Type': 'text/plain',
          });
          res.end('Server Error');
        }
      });
    } else if (req.method === 'POST' && requestedPath === 'add-expense') {
      const form = new formidable.IncomingForm();

      form.parse(req, (err, fields) => {
        if (
          err ||
          fields.date === undefined ||
          fields.title === undefined ||
          fields.amount === undefined
        ) {
          res.writeHead(400, {
            'Content-type': 'text/plain',
          });

          return res.end('Invalid form data');
        }

        fs.writeFileSync(
          EXPENSES_FILE,
          JSON.stringify(parseFieldsData(fields), null, 2),
          'utf8',
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });

        res.end(JSON.stringify(parseFieldsData(fields), null, 2));
      });
    } else {
      res.writeHead(404, {
        'Content-type': 'text/plain',
      });

      return res.end('Not found');
    }
  });

  return server;
}

module.exports = { createServer };

function parseFieldsData(fields) {
  const data = {
    date: fields.date,
    title: fields.title,
    amount: fields.amount,
  };

  return data;
}
