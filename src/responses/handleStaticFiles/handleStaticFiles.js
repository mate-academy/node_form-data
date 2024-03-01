'use strict';

const path = require('path');
const { readPublicFile } = require('./readPublicFile');
const { mimeTypes } = require('./mimeTypes');

function handleStaticFiles(request, response) {
  let { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname === '/') {
    pathname = '/index.html';
  }

  readPublicFile(pathname)
    .then(file => {
      const ext = path.extname(pathname);
      const mimeType = mimeTypes[ext];

      response.setHeader('Content-Type', mimeType);
      response.end(file);
    })
    .catch(() => {
      response.statusCode = 404;
      response.end('Not Found');
    });
}

module.exports = {
  handleStaticFiles,
};
