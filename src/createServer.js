'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Helper function to send HTTP responses
 * @param {http.ServerResponse} res - Response object
 * @param {number} statusCode - HTTP status code (200, 404, 500, etc.)
 * @param {string} contentType - Content-Type header value
 * @param {string|object} data - Data to send (will be stringified if object)
 */
function sendResponse(res, statusCode, contentType, data) {
  res.writeHead(statusCode, { 'Content-Type': contentType });

  // If data is an object and content type is JSON, stringify it
  if (typeof data === 'object' && contentType === 'application/json') {
    res.end(JSON.stringify(data));
  } else {
    res.end(data);
  }
}

function createServer() {
  const server = http.createServer((req, res) => {
    const { method, url } = req;

    // Serve index.html
    if (method === 'GET' && url === '/') {
      const filePath = path.resolve(__dirname, '../public/index.html');

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          sendResponse(res, 500, 'text/plain', 'Error loading page');

          return;
        }

        sendResponse(res, 200, 'text/html', data);
      });

      return;
    }

    // Serve styles.css
    if (method === 'GET' && url === '/styles.css') {
      const filePath = path.resolve(__dirname, '../public/styles.css');

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          sendResponse(res, 500, 'text/plain', 'Error loading stylesheet');

          return;
        }

        sendResponse(res, 200, 'text/css', data);
      });

      return;
    }

    // Handle POST request - save expense data
    if (method === 'POST' && url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let expense;

        try {
          // Parse JSON body
          expense = JSON.parse(body);
        } catch (error) {
          sendResponse(res, 400, 'application/json', { error: 'invalid JSON' });

          return;
        }

        // Validate required fields
        const requiredFields = ['date', 'title', 'amount'];
        const missingFields = requiredFields.filter((field) => !expense[field]);

        if (missingFields.length > 0) {
          sendResponse(
            res,
            400,
            'text/plain',
            `Missing required fields: ${missingFields.join(', ')}`,
          );

          return;
        }

        // Save to file
        const dataPath = path.resolve(__dirname, '../db/expense.json');
        const dirPath = path.dirname(dataPath);

        // Enshore directory exists
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        try {
          fs.writeFileSync(dataPath, JSON.stringify(expense, null, 2));

          // Return HTML page with well-formatted JSON
          const html = `<pre>${JSON.stringify(expense, null, 2)}</pre>`;

          sendResponse(res, 200, 'text/html', html);
        } catch (error) {
          sendResponse(res, 500, 'application/json', {
            error: 'Failed to save expense',
          });
        }
      });

      return;
    }

    // Handle 404 for all other routes
    sendResponse(res, 404, 'text/plain', 'Not found');
  });

  return server;
}

module.exports = {
  createServer,
};
