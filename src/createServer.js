/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { formidable, errors: formidableErrors } = require('formidable');
const { pipeline } = require('stream');

const getContentType = require('./helpers/getContentType');
const normalizeFormData = require('./helpers/normalizeFromData');
const getAllExpenses = require('./helpers/getAllExpenses');

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
  const form = formidable({});
  let fields;

  try {
    [fields] = await form.parse(req);
  } catch (err) {
    if (err.code === formidableErrors.maxFieldsExceeded) {
      throw new Error('Form field error', err);
    }

    console.error(err);
    res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
    res.end(String(err));

    return;
  }

  try {
    const newExpense = normalizeFormData(fields);
    const myExpenses = await getAllExpenses();

    myExpenses.push(newExpense);

    const writableStream = fs.createWriteStream(PATH_TO_DB);

    writableStream.write(JSON.stringify(myExpenses, null, 2));

    writableStream.on('error', () => {
      console.log('Add new expanses Error: writeble stream');
    });

    writableStream.end();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(myExpenses, null, 2));

    console.log('Expenses updated successfully.');
  } catch (err) {
    console.error('Error updating expenses:', err);
  }
}

module.exports = {
  createServer,
};
