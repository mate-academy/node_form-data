'use strict';

const http = require('http');

const { writeFile } = require('fs/promises');

const formidable = require('formidable');

const { htmlFormTemplate } = require('./htmlFormTemplate');
const { getHtmlResponseTemplate } = require('./getHtmlResponseTemplate');

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  if (req.url === '/data' && req.method.toLowerCase() === 'post') {
    const form = formidable({ multiples: true });
    
    form.parse(req, async (error, fields) => {
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(String(error));
  
        return;
      }

      const jsonData = JSON.stringify(fields, null, 2);

      await writeFile('data.json', jsonData, (error) => {
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(String(error));
        }
      });

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getHtmlResponseTemplate(jsonData));
    });
  }
  
  if (req.url === '/') {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(htmlFormTemplate);
  }

  res.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
});

server.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});
