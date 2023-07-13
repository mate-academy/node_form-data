/* eslint-disable no-console */
'use strict';

const formidable = require('formidable');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { FormattedHTML } = require('./formattedHTML');
const { pipeline } = require('stream');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.url === '/download' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end(err, 'ERROR');

        return;
      }

      const filePath = path.join(__dirname, `${fields.name}.json`);

      fs.writeFile(filePath, JSON.stringify(fields), (error) => {
        if (error) {
          console.error(error);
        } else {
          const file = fs.createReadStream(filePath);

          const transformed = new FormattedHTML();

          res.setHeader('Content-Type', 'text/html');

          pipeline(file, transformed, res, (er) => {
            if (er) {
              console.error('Pipeline failed.', er);
            }
          });
        }
      });
    });
  } else {
    const htmlFile = fs.createReadStream('./public/index.html');

    htmlFile.pipe(res);

    res.writeHead(200, { 'Content-Type': 'text/html' });

    htmlFile.on('error', (err) => {
      console.log(err);

      res.statusCode = 400;
      res.end('Something went wrong');
    });

    res.on('close', () => {
      htmlFile.destroy();
    });
  }
});

server.on('error', (error) => {
  console.log(error);
});

server.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
