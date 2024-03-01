'use strict';

const http = require('http');
const { handleAddExpense } = require('./responses/handleAddExpense/handleAddExpense');
const { handleStaticFiles } = require('./responses/handleStaticFiles/handleStaticFiles');
const { handleGetExpenses } = require('./responses/handleGetExpenses/handleGetExpenses');

function createServer() {
  const server = http.createServer((request, response) => {
    const { url, method: rawMethod } = request;
    const method = rawMethod.toUpperCase();

    if (url === '/add-expense' && method === 'POST') {
      handleAddExpense(request, response);
    } else if (url === '/get-expenses' && method === 'GET') {
      handleGetExpenses(request, response);
    } else {
      handleStaticFiles(request, response);
    }
  });

  /* eslint-disable-next-line no-console */
  server.on('error', console.error);

  return server;
}

module.exports = {
  createServer,
};
