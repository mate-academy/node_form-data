'use strict';

const http = require('http');
const { form } = require('./form');

const server = http.Server();

server.on('request', (req, res) => {
  if (req.url === '/upload') {
    const chunks = [];
    const dataObj = {};

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const data = Buffer.concat(chunks).toString();
      const dataArray = data.split('&');

      dataArray.forEach(slice => {
        const arrOfSlice = slice.split('=');
        const key = arrOfSlice[0];
        const value = arrOfSlice[1];

        dataObj[key] = value;
      });

      const formattedData = JSON.stringify(dataObj, null, 2);

      res.end(formattedData);
    });

    res.on('error', () => {
      throw Error;
    });
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.write(form);
    res.end();
  }
});

server.on('error', () => {
  throw Error;
});

server.listen(3000);
