'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');

const PORT = 5700;

const server = http.Server();

server.on('request', (req, res) => {
  if(req.method === 'POST') {
    const jsonPath = path.resolve('src', 'index.json');
    const chunks = [];

    if (!fs.existsSync(jsonPath)) {
      res.readStatus = 500;
      res.end()
      return;
    }
    const jsonFile = fs.readFileSync(jsonPath, 'utf8');

    if (!fs.existsSync(jsonFile)) {
      res.readStatus = 500;
      res.end()
      return;
    }
    const jsonParse = JSON.parse(jsonFile);
    
    if (req.url.slice(1) === 'favicon.ico') {
      return;
    }

    req.on('data', (chunk) => {    
      chunks.push(chunk
        .toString()
        .split('&')
        .map(info => info.split('=')));
    });
    
    req.on('end', () => {
      jsonParse.push(Object.fromEntries(...chunks));
      
      fs.writeFileSync(jsonPath, JSON.stringify(jsonParse, null, 2));
    })

    res.writeHead(302, { Location: '/' });

    res.end();
  } else if (req.method === 'GET') {
    const htmlPath = path.resolve('public', 'index.html');
    const gzip = zlib.createGzip();

    if (!fs.existsSync(htmlPath)) {
      res.readStatus = 500;
      res.end('Error from server');
      return;
    }

    const htmlFile =  fs.createReadStream(htmlPath);

    res.setHeader('Content-Encoding', 'gzip');

    pipeline(htmlFile, gzip, res, (err) => {
      if(err) {
        res.readStatus = 500;
        res.end();
      }
    });
  } else {
    res.readStatus = 404;
    res.end('Page not found.');
    return;
  }
});

server.listen(PORT, () => {
  process.stdout.write(`Server is working http://localhost:${PORT}\n`);
})