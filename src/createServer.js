/* eslint-disable no-console */
const fs = require('fs').promises;
const http = require('http');
const path = require('path');
const { parse } = require('querystring');

function createServer() {
  const server = http.createServer();

  server.on('request', async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      await serverForm(res);
    } else if (req.method === 'POST' && url.pathname === '/add-expense') {
      await handleFormSubmission(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  return server;
}

async function serverForm(res) {
  try {
    const indexPath = path.resolve('public', 'index.html');
    const data = await fs.readFile(indexPath);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  } catch (err) {
    console.error('Error reading index.html:', err);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Internal Server Error</h1>');
  }
}

async function handleFormSubmission(req, res) {
  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString();

    let postData;
    const contentType = req.headers['content-type'];

    if (contentType.includes('application/json')) {
      postData = JSON.parse(body);
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      postData = parse(body);
    }

    if (!postData.date || !postData.title || !postData.amount) {
      res.writeHead(400, { 'Content-Type': 'text/html' });

      return res.end('<h1>Missing required fields</h1>');
    }

    const filePath = path.resolve('db', 'expense.json');

    await fs.writeFile(filePath, JSON.stringify(postData, null, 2));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(postData, null, 2));
  } catch (err) {
    console.error('Error during form submission:', err);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Internal Server Error</h1>');
  }
}

module.exports = {
  createServer,
};
