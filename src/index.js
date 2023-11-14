'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');

function myFunction() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const fileName = url.pathname.slice(1) || 'index.html';
    const filePath = path.resolve('public', fileName);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('File not found');

      return;
    }

    const fileStream = fs.createReadStrem(filePath);

    fileStream.on('error', (err) => {
      res.statusCode = 500;
      res.end(`Server error: ${err}`);
    });

    res.on('close', () => fileStream.destroy());
  });

  server.on('error', () => {});

  server.listen(3005);
}

module.exports = {
  myFunction,
};
