'use strict';

const http = require('http');
const fs = require('fs');
const server = new http.Server();
const queryParser = require('./queryParser');
const updateJSON = require('./updateJSON');

server.on('request', (req, res) => {
  switch (req.url) {
    case '/favicon':
      res.end();

      return;

    case '/':
      const homepage = fs.createReadStream('src/public/index.html');

      homepage.pipe(res);
      res.on('end', () => {
        homepage.destroy();
      });

      return;

    case '/form':
      req.on('data', (chunk) => {
        const newData = queryParser(chunk.toString());
        const output = updateJSON(newData);

        res.end(output)
      })
  }
})

server.on('error', () => {});

module.exports = server;
