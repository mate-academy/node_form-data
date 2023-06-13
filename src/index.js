'use strict';
/* eslint-disable no-console */

const http = require('http');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { TransformToHTML } = require('./transformToHTML');

const PORT = process.env.PORT || '3000';

const server = http.createServer((req, res) => {
  if (req.url === '/download' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end(JSON.stringify(err));

        return;
      }

      const filePath = path.join(__dirname, `${fields.name}.json`);

      fs.writeFile(filePath, JSON.stringify(fields), (error) => {
        if (error) {
          console.error(err);
        } else {
          const sum = fs.createReadStream(filePath);

          const transformJSON = new TransformToHTML();

          res.setHeader('Content-type', 'text/html');
          sum.pipe(transformJSON).pipe(res);
        }
      });
    });
  } else {
    const htmlFile = fs.createReadStream('./public/index.html');

    htmlFile.pipe(res);

    res.writeHead(200, { 'Content-Type': 'text/html' });

    htmlFile.on('error', error => {
      console.log(error);

      res.statusCode = 400;
      res.end('Something went wrong!');
    });

    res.on('close', () => {
      htmlFile.destroy();
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
