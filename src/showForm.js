'use strict';

const fs = require('fs');

const showForm = (res) => {
  const form = fs.createReadStream('./public/index.html');

  res.setHeader('Content-Type', 'text/html');
  form.pipe(res);

  form.on('error', (err) => {
    res.statusCode = 500;
    res.end('Server error');

    // eslint-disable-next-line no-console
    console.error(err);
  });
};

module.exports = { showForm };
