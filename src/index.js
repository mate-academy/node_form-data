/* eslint-disable no-console */
'use strict';

const http = require('http');
const { handleUpload } = require('./handleUpload');
const { showForm } = require('./showForm');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    handleUpload(req, res);
  } else {
    showForm(res);
  }
});

server.on('error', () => {});

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
