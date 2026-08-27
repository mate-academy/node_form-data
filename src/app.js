'use strict';
/* eslint-disable no-console */

const { createServer } = require('./createServer');

createServer().listen(5701, () => {
  console.log(`Server is running on http://localhost:${5701} 🚀`);
  console.log('Available at http://localhost:5701');
});
