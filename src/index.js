'use strict';

const server = require('./server');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`, '🚀');
})
