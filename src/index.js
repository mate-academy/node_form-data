/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1) || 'index.html';

  if (pathname === 'index.html') {
    res.setHeader('Content-Type', 'text/html');

    const file = fs.createReadStream('src/index.html');

    file.pipe(res);

    file.on('error', () => {
      res.statusCode = 404;
      res.end();
    });
  } else if (pathname === 'data') {
    const form = new formidable.IncomingForm();

    res.setHeader('Content-Type', 'text/html');

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end();
      }

      fs.writeFileSync('src/data.json', JSON.stringify(fields));

      const fileStream = fs.createReadStream('src/data.json');

      fileStream.pipe(res);

      fileStream.on('error', () => {
        res.statusCode = 404;
        res.end();
      });
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
