'use strict';

const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const formidable = require('formidable');
const { pipeline } = require('stream');
const { writeLog } = require('./writeLog');

const server = new http.Server();

server.on('request', (req, res) => {
  const normalizedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathName = normalizedUrl.pathname.slice(1) || 'index.html';

  if (pathName === 'index.html') {
    const file = fs.createReadStream('public/index.html');

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Encoding', 'gzip');

    pipeline(file, zlib.createGzip(), res, () => {
      res.statusCode = 500;
      res.statusMessage = 'error has sprang';
      res.end();
    });

    res.on('close', () => {
      file.destroy();
    });

    return;
  }

  if (pathName === 'addSpending') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 500;
        res.statusMessage = 'error has sprang';
        res.end();
      }

      res.setHeader('Content-Type', 'text/html');

      const {
        title,
        amount,
        date,
      } = fields;

      writeLog(title, amount, date);

      const file = fs.createReadStream('public/spendingsLog.html');

      file.on('data', (chunk) => {
        const canProceed = res.write(chunk);

        if (canProceed) {
          return;
        }

        file.pause();

        res.once('drain', () => {
          file.resume();
        });
      });

      file.on('end', () => {
        res.statusCode = 200;
        res.end('</tbody></table>');
      });

      file.on('error', () => {
        res.statusCode = 500;
        res.statusMessage = 'error has sprang';
        res.end();
      });

      res.on('close', () => {
        file.destroy();
      });
    });
  }
});

server.listen(3000);
