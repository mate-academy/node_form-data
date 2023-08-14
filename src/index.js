'use strict';
/* eslint-disable no-console */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { IncomingForm } = require('formidable');
const { getFormDataHtml } = require('./modules/getFormDataHtml');

const PORT = process.env.PORT || 8080;
const server = new http.Server();

const REQUESTS = {
  index: '/ get',
  data: '/data post',
};

server.on('request', (req, res) => {
  const requestType = `${req.url} ${req.method.toLowerCase()}`;

  switch (requestType) {
    case REQUESTS.index: {
      const url = new URL(req.url, `http://${req.headers.host}`);

      const fileName = url.pathname.slice(1) || 'index.html';
      const filePath = path.resolve('public', fileName);
      const fileStream = fs.createReadStream(filePath);

      if (!fs.existsSync(filePath)) {
        res.statusCode = 404;
        res.end('File does not exist');
      }

      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        res.statusCode = 500;
        res.end(`Server Error: ${error}`);
      });

      fileStream.on('close', () => {
        fileStream.destroy();
      });

      break;
    }

    case REQUESTS.data: {
      const form = new IncomingForm();

      form.parse(req, (err, fields) => {
        if (err) {
          res.statusCode = 400;
          res.end(err);

          return;
        }

        const {
          date,
          title,
          amount,
        } = fields;

        if (!date[0].trim() || !title[0].trim() || !amount[0].trim()) {
          res.statusCode = 400;
          res.end('All fields are required.');

          return;
        }

        const formData = {
          date: date[0],
          title: title[0],
          amount: amount[0],
        };

        const filepath = path.join(__dirname, 'history', `${date[0]}.json`);

        const formDataStream = fs.createWriteStream(filepath);

        formDataStream.on('error', () => {
          res.statusCode = 500;
          res.end('Server error');
        });

        formDataStream.write(JSON.stringify(formData, null, 2));
        formDataStream.end();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        res.end(getFormDataHtml(formData));
      });

      break;
    }

    default:
      res.statusCode = 404;
      res.end('Page not found');
      break;
  }
});

server.on('error', (error) => {
  console.log(`Error occured: ${error}`);
});

server.listen(PORT, () => {
  console.log('Server started! 🚀');
  console.log(`http://localhost:${PORT}`);
});
