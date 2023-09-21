/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const zlib = require('zlib');

const PORT = 8080;

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let data = Buffer.from([]);

    req.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]);
    });

    req.on('end', () => {
      const formData = data.toString();
      const formDataPairs = formData.split('&');
      const formDataObject = {};

      formDataPairs.forEach((pair) => {
        const [key, value] = pair.split('=');

        formDataObject[key] = value;
      });

      res.setHeader('Content-type', 'application/json');
      res.end(JSON.stringify(formDataObject));
    });

    return;
  }

  const fileStream = fs.createReadStream('./src/index.html');
  const gzip = zlib.createGzip();

  res.setHeader('Content-Encoding', 'gzip');

  fileStream.pipe(gzip).pipe(res);

  fileStream.on('error', (err) => {
    console.error(err);
  });

  res.on('close', () => {
    fileStream.destroy();
    gzip.destroy();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
