'use strict';

const getHtmlResponse = (jsonData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Submitted</title>
    </head>
    <body>
      <h1>Expense Submitted</h1>
      <pre>${jsonData}</pre>
    </body>
    </html>
  `;
};

module.exports = { getHtmlResponse };
