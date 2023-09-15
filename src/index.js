'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const PORT = process.env.PORT || 3000;
const jsonFile = './src/expense.json';

const server = new http.Server();

server.on('request', (req, res) => {
  const normalizedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathName = normalizedUrl.pathname.slice(1) || 'index.html';

  if (pathName === 'index.html') {
    res.setHeader('Content-Type', 'text/html');

    const readData = fs.createReadStream(`./src/public/${pathName}`);

    readData.on('error', () => {
      res.statusCode = 400;
      res.end();
    });

    readData.pipe(res);

    res.on('close', () => {
      readData.destroy();
    });

    return;
  }

  // ...

  if (pathName === 'expense') {
    const form = new formidable.IncomingForm();

    form.parse(req, (error, fields) => {
      if (error) {
        res.statusCode = 500;
        res.end();

        return;
      }

      const jsonFields = JSON.stringify(fields, null, 2);

      fs.writeFile(jsonFile, jsonFields, (writeError) => {
        if (writeError) {
          res.statusCode = 500;
          res.end('Error Occurred');

          return;
        }

        const readData = fs.createReadStream(jsonFile);

        res.setHeader('Content-Type', 'application/json');
        readData.pipe(res);

        readData.on('error', () => {
          res.statusCode = 500;
          res.end('Error Occurred');
        });

        res.on('close', () => {
          readData.destroy();
        });

        res.end(jsonFields);
      });
    });

    return;
  }

  // ...

  res.statusCode = 404;
  res.end('File does not exist');
});

server.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server is running on http://localhost:${PORT}`);
});
