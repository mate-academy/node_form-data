/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const { pipeline } = require('stream');
const getContentType = require('./helpers/getContentType');

const ITERNAL_SERVER_ERR = 'Internal Server Error';
const PATH_TO_DB = path.join(__dirname, '../db', 'expense.json');

function createServer() {
  const server = new http.Server();

  server.on('error', handleServerError);
  server.on('request', handleRequest);

  return server;
}

function handleServerError(err) {
  console.log(`${ITERNAL_SERVER_ERR}: ${err}`);
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1) || 'index.html';

  if (pathname.includes('index') || pathname.includes('images')) {
    handleStaticFile(pathname, res);

    return;
  }

  if (req.method.toLowerCase() === 'post' && pathname === 'add-expense') {
    handleAddNewExpense(req, res);

    return;
  }

  res.statusCode = 404;
  res.end('Not found');
}

function handleStaticFile(pathname, res) {
  const pathToFile = path.resolve('src', 'public', pathname);
  const fileStream = fs.createReadStream(pathToFile);
  const br = zlib.createBrotliCompress();

  fileStream.on('error', (err) => {
    console.error(`Error reading file: ${err}`);
    res.statusCode = 500;
    res.end(ITERNAL_SERVER_ERR);
  });

  br.on('error', (err) => {
    console.error(`Error compressing file: ${err}`);
    res.statusCode = 500;
    res.end(ITERNAL_SERVER_ERR);
  });

  res.writeHead(200, 'OK', {
    'Content-Type': getContentType(path.extname(pathname)),
    'Content-Encoding': 'br',
  });

  pipeline(fileStream, br, res, (err) => {
    if (err) {
      console.error(`Pipeline error: ${err}`);
      res.statusCode = 500;
      res.end(ITERNAL_SERVER_ERR);
    }
  });

  res.on('close', () => {
    fileStream.destroy();
    br.destroy();
  });
}

async function handleAddNewExpense(req, res) {
  let formData = '';

  req.on('data', (chunk) => {
    formData += chunk;
  });

  req.on('end', () => {
    try {
      console.log('Received expense data:', JSON.parse(formData));

      const form = JSON.parse(formData);

      if (Object.keys(form).length < 3) {
        writeNewExpense(res, {});

        return;
      }

      writeNewExpense(res, form);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Error parsing JSON');
    }
  });
}

function writeNewExpense(res, newExpense) {
  const writableStream = fs.createWriteStream(PATH_TO_DB);
  const notEmpty = Object.keys(newExpense).length;

  writableStream.on('error', () => {
    console.log('Add new expanses Error: writeble stream');
  });

  writableStream.on('finish', () => {
    if (notEmpty) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newExpense), null, 2);
    } else {
      res.writeHead(400, 'Invalid form data');
      res.end('Invalid form inputs');
    }
  });

  writableStream.write(JSON.stringify(newExpense, null, 2));
  writableStream.end();

  console.log('Expenses updated successfully.');
}

module.exports = {
  createServer,
};
