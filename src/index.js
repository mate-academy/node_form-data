'use strict';

const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const formidable = require('formidable');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const fileName = url.pathname.slice(1) || 'index.html';
  const filePath = path.resolve('public', fileName);

  if (fileName === 'data') {
    const form = formidable({});

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 500;
        res.end('Something went wrong');
      }

      const { date, title, amount } = fields;

      const html = `<ul>
         <li>Date: ${date}</li>
         <li>Title: ${title}</li>
         <li>Amount: ${amount}</li>
        </ul>`;

      res.setHeader('Content-Type', 'text/html');

      res.end(html);
    });
  } else {
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('File does not exist');

      return;
    }

    res.setHeader('Content-Encoding', 'gzip');

    const file = fs.createReadStream(filePath);
    const gzip = zlib.createGzip();

    file
      .pipe(gzip)
      .pipe(res);

    file.on('error', () => {
      res.statusCode = 500;
      res.end('Something went wrong');
    });

    res.on('close', () => {
      file.destroy();
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
