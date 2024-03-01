'use strict';

const fs = require('fs/promises');
const path = require('path');
const PUBLIC_FOLDER = 'public';

function readPublicFile(pathname) {
  return fs.readFile(path.join(PUBLIC_FOLDER, pathname));
}

module.exports = {
  readPublicFile,
};
