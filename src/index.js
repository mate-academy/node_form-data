/* eslint-disable no-console */
'use strict';

const PORT = process.env.PORT || 8080;

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.url === '/data' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 500;
        res.end('Something went wrong');

        return;
      }

      const filePath = path.join(__dirname, `${fields.title}.json`);

      const data = JSON.stringify(fields, null, 2);
      const { date, title, amount } = fields;

      fs.writeFile(filePath, data, (errWrite) => {
        if (errWrite) {
          console.log(errWrite);
        } else {
          res.setHeader('Content-Type', 'text/html');

          res.end(`
            <div>
              <div>
                Date: ${date.join('')}
              </div>
              <div>
                Name: ${title.join('')}
              </div>
              <div>
                Amount: ${amount.join('')}
              </div>
            </div>
          `);
        }
      });
    });
  } else {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const fileName = url.pathname.slice(1) || 'index.html';
    const filePath = path.resolve('public', fileName);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Page not found');

      return;
    }

    res.setHeader('Content-Type', 'text/html');

    const file = fs.createReadStream(filePath);

    file
      .on('error', () => {
        res.statusCode = 500;
        res.end('Something went wrong');
      })
      .pipe(res)
      .on('error', () => {
        res.statusCode = 500;
        res.end('Something went wrong');
      });

    res.on('close', () => {
      file.destroy();
    });
  }
});

server.on('error', (error) => {
  console.log(error);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
