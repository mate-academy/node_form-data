/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');
const formidable = require('formidable');
const { getDataTable } = require('./public/dataTable');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', async(req, res) => {
  if (req.url === '/formdata' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        console.log(err);
        res.statusCode = 400;
        res.end(String(err));

        return;
      }

      fs.writeFile(
        './src/public/data.json',
        JSON.stringify(fields),
        (error) => {
          if (error) {
            res.statusCode = 404;
            res.end();
            console.log(error);
          }
        },
      );

      res.end(getDataTable(fields.date, fields.title, fields.amount));
    });
  } else {
    const file = fs.createReadStream('./src/public/index.html');

    pipeline(file, res, (err) => {
      if (err) {
        res.statusCode = 404;
        res.end();
      }
    });
  }
});

server.on('error', (err) => {
  console.log(err);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
