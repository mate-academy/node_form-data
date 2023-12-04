/* eslint-disable no-console */
'use strict';

const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

const server = http.createServer(async(req, res) => {
  const normalizeUrl = new URL(req.url, `http://${req.headers.host}`);
  const filePath = normalizeUrl.pathname.slice(1) || 'index.html';

  if (filePath === 'index.html') {
    const data = fs.createReadStream(
      path.join(__dirname, `../public/${filePath}`)
    );

    data.pipe(res);

    data.on('error', (err) => {
      console.log(err);

      res.statusCode = 500;
      res.end('Server error');
    });

    data.on('close', () => data.destroy());

    return;
  }

  if (filePath === 'JSON' && req.method.toUpperCase() === 'POST') {
    const form = new formidable.IncomingForm();
    const uploadFolder = path.join(__dirname, '../tepm');

    form.uploadDir = uploadFolder;

    await form.parse(req, (error, fields, files) => {
      if (error) {
        console.log(error);

        return;
      }

      if (files.file) {
        fs.rm(
          path.join(uploadFolder, files.file[0].newFilename),
          {
            force: true,
            maxRetries: 10,
            recursive: true,
            retryDelay: 300,
          },
          (err) => {
            console.log(err);
          }
        );
      }

      const normalizeData = JSON.stringify(fields);

      fs.writeFile(
        path.join(__dirname, '../public/data.json'),
        normalizeData,
        (err) => {
          if (err) {
            res.statusCode = 500;
            res.end('File error');
          }
        });

      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;

      res.write(
        `
        Date: ${fields.date}
        Title: ${fields.text}
        Amount: ${fields.amount}
      `
      );

      res.end();
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
