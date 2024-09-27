'use strict';

const { Server } = require('node:http');
const fs = require('fs');
const formidable = require('formidable');

function createServer() {
  const server = new Server();

  server.on('request', async (req, res) => {
    if (req.url === '/submit-expense' && req.method === 'POST') {
      const FILE_WITH_DATA = './public/file.txt';

      if (fs.existsSync(FILE_WITH_DATA)) {
        try {
          await fs.promises.unlink(FILE_WITH_DATA);
        } catch {
          res.writeHead(400, { 'Content-Type': 'text/plain' });

          return res.end('Cant clear a file before writing new data');
        }
      }

      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });

          return res.end('Error parsing form data');
        }

        if (!fields.date || !fields.title || !fields.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });

          return res.end('All filds should be filled');
        }

        const date = fields.date[0];
        const title = fields.title[0];
        const amount = fields.amount[0];

        try {
          await fs.promises.appendFile(FILE_WITH_DATA, `${date}\n`);
          await fs.promises.appendFile(FILE_WITH_DATA, `${title}\n`);
          await fs.promises.appendFile(FILE_WITH_DATA, `${amount}\n`);
        } catch {
          res.writeHead(500, { 'Content-Type': 'text/plain' });

          return res.end('Error appending data to file');
        }

        const fileStream = fs.createReadStream(FILE_WITH_DATA, 'utf8');

        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Content-Disposition': 'inline; filename=asd',
        });

        fileStream
          .on('error', () => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading ready file');
          })
          .pipe(res);

        res.on('finish', () => fileStream.destroy());
      });
    } else if (req.url === '/') {
      const FORM_PAGE = './public/index.html';

      if (!fs.existsSync(FORM_PAGE)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');

        return;
      }

      const fileStream = fs.createReadStream(FORM_PAGE, 'utf8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      fileStream.pipe(res);

      fileStream.on('error', () => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading file');
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('URL Not Found');
    }
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};
