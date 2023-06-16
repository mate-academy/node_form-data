'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const multiparty = require('multiparty');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const pathFileHTML = path.join(__dirname, 'pages', 'index.html');

    const readStream = fs.createReadStream(pathFileHTML);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    readStream.pipe(res);

    readStream.on('error', (err) => {
      res.statusCode = 404;
      res.end('Error: ' + err);
    });

    return;
  }

  if (req.url === '/data') {
    const form = new multiparty.Form();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 404;
        res.end('Error');

        return;
      }

      const newInfo = {};

      for (const key in fields) {
        newInfo[key] = fields[key][0];
      }

      const pathToJSON = path.join(__dirname, 'data', 'data.json');

      fs.readFile(pathToJSON, 'utf8', (errorRead, jsonData) => {
        if (errorRead) {
          res.statusCode = 404;
          res.end('Can not read file');

          return;
        }

        let dataFromJson;

        try {
          dataFromJson = JSON.parse(jsonData);
        } catch (e) {
          dataFromJson = [];
        }

        const newData = JSON.stringify([...dataFromJson, newInfo], null, 2);

        fs.writeFile(pathToJSON, newData, (errWrite) => {
          if (errWrite) {
            res.statusCode = 404;
            res.end('Can not write file');

            return;
          }

          const htmlResponse = `<pre>${newData}</pre>`;

          res.setHeader('Content-Type', 'text/html');
          res.end(htmlResponse);
        });
      });
    });

    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(3000, () => {
  process.stdout.write('Server is running on http://localhost:3000');
});
