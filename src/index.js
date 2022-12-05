'use strict';

const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');
const formidable = require('formidable');

function sendAnErr(res, err) {
  res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
  res.end(String(err));
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const index = fs.createReadStream('./src/index.html');

    pipeline(index, res, err => {
      if (err) {
        sendAnErr(res, err);
      }
    });
  }

  if (req.url === '/upload' && req.method === 'POST') {
    const form = formidable();

    form.parse(req, (err, fields) => {
      if (err) {
        sendAnErr(res, err);

        return;
      }

      fs.writeFileSync('./form.json', JSON.stringify(fields, null, 2));

      const readJson = fs.createReadStream('./form.json');

      pipeline(readJson, res, error => {
        if (error) {
          sendAnErr(res, error);
        }
      });
    });
  }
});

server.listen(8080);
