'use strict';

const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');
const formidable = require('formidable');

function sendAnErr(res, err) {
  res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
  res.end(String(err));
}

function handleIndex(req, res) {
  const index = fs.createReadStream('./src/index.html');

  pipeline(index, res, err => {
    if (err) {
      sendAnErr(res, err);
    }
  });
}

function handleUpload(req, res) {
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

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    handleIndex(req, res);
  }

  if (req.url === '/upload' && req.method === 'POST') {
    handleUpload(req, res);
  }
});

server.listen(8080);
