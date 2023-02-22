'use strict';

function resultJson(fields) {
  return `
  <html>
    <head>
      <title>Expense Added</title>
    </head>
    <body>
      <h1>Expense Added</h1>
      <pre>${JSON.stringify(fields, null, 2)}</pre>
    </body>
  </html>
`;
};

module.exports.resultJson = resultJson;
