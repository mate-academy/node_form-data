/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const formidable = require('formidable');
const { jsonToHtmlStream } = require('./jsonToHtmlTableStream');
const { pipeline } = require('stream');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    const formData = new formidable.IncomingForm();

    formData.parse(req, (err, fields) => {
      if (err) {
        console.log(err);
      }

      const filePath = path.join(__dirname, 'amount.json');

      fs.writeFile(filePath, JSON.stringify(fields), (error) => {
        if (error) {
          console.log(error);
        } else {
          const amount = fs.createReadStream(filePath);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');

          pipeline(amount, jsonToHtmlStream, res, (e) => {
            if (e) {
              console.log(e);
            }
          });
        }
      });
    });
  } else {
    const form = fs.createReadStream('./public/index.html');

    res.setHeader('Content-Type', 'text/html');
    form.pipe(res);

    form.on('error', (err) => {
      res.statusCode = 500;
      res.end('Server error');

      console.error(err);
    });
  }
});

server.on('error', () => {});

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
