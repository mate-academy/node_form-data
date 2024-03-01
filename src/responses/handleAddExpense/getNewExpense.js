'use strict';

async function getNewExpense(request) {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk.toString();
  });

  return new Promise(resolve => {
    request.on('end', () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = {
  getNewExpense,
};
