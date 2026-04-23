'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_PUBLIC_DIR = path.resolve('public');

function sendBadRequest(res) {
  res.statusCode = 400;
  res.end('Bad request');
}

function sendStaticFiles(rawUrl, res) {
  const normalizedUrl = rawUrl.slice(1) || 'index.html';
  const filePath = path.resolve(BASE_PUBLIC_DIR, normalizedUrl);

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end('File not found!');

    return;
  }

  const fileStream = fs.createReadStream(filePath);

  fileStream.pipe(res);

  fileStream.on('error', () => {
    res.statusCode = 500;
    res.end('Error during reading file');
  });

  fileStream.on('close', () => {
    fileStream.destroy();
  });
}

function handleRawFormData(formdata, res) {
  if (!formdata) {
    sendBadRequest(res);

    return;
  }

  const dataToParams = new URLSearchParams(formdata);

  if (
    !dataToParams.get('date') ||
    !dataToParams.get('title') ||
    !dataToParams.get('amount')
  ) {
    sendBadRequest(res);

    return;
  }

  return Object.fromEntries(dataToParams);
}

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    res.statusCode = 200;

    if (req.method === 'GET') {
      sendStaticFiles(req.url, res);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      res.setHeader('Content-type', 'application/json');

      const chunks = [];
      let rawData = '';

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        rawData = Buffer.concat(chunks).toString();

        let preparedData = '';

        // extra logic: in tests cases requests are in application/json,
        // but IRL, formdata usually comes as application/x-form-encoded
        // hope that MA guys will re-write this task (as well as previous one)
        const contentTypeHeaders = req.headers['content-type'] || '';

        if (contentTypeHeaders.includes('application/json')) {
          preparedData = JSON.parse(rawData);
        } else {
          preparedData = handleRawFormData(rawData, res);
        }

        if (!preparedData.date || !preparedData.title || !preparedData.amount) {
          sendBadRequest(res);

          return;
        }

        fs.writeFile(
          path.resolve('db/expense.json'),
          JSON.stringify(preparedData),
          () => {
            res.end(JSON.stringify(preparedData));
          },
        );
      });
    }
  });

  return server;
}

module.exports = {
  createServer,
};
