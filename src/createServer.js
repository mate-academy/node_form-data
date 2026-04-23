'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { text } = require('stream/consumers');

function createServer() {
  return http.createServer(async (req, res) => {
    const { method, url } = req;

    if (url === '/' && method === 'GET') {
      await serveHomePage(res);

      return;
    }

    if (url === '/add-expense' && method === 'POST') {
      await processExpenseSubmission(req, res);

      return;
    }

    sendErrorResponse(res, 404, 'Invalid URL');
  });
}

async function serveHomePage(res) {
  const htmlFilePath = path.join(__dirname, 'public', 'index.html');

  try {
    const htmlContent = await fs.readFile(htmlFilePath, 'utf8');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error loading HTML');
  }
}

async function processExpenseSubmission(req, res) {
  try {
    const requestBodyText = await text(req);
    const expenseData = parseExpenseData(requestBodyText);

    const { date, title, amount } = expenseData;

    if (!date || !title || !amount) {
      sendErrorResponse(res, 400, 'Missing required fields');

      return;
    }

    const databaseFilePath = path.join(__dirname, '..', 'db', 'expense.json');

    await fs.writeFile(databaseFilePath, JSON.stringify(expenseData), 'utf8');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(expenseData));
  } catch (error) {
    sendErrorResponse(res, 500, 'Server Error');
  }
}

function parseExpenseData(bodyText) {
  try {
    return JSON.parse(bodyText);
  } catch {
    const formData = new URLSearchParams(bodyText);

    return {
      date: formData.get('date'),
      title: formData.get('title'),
      amount: formData.get('amount'),
    };
  }
}

function sendErrorResponse(res, statusCode, errorMessage) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(errorMessage);
}

module.exports = { createServer };
