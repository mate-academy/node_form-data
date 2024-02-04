/* eslint-disable no-console */
'use strict';

const { createServer } = require('./createServer');
const PORT = 5701;

createServer()
  .listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
    console.log('Available at http://localhost:5701');
  });
