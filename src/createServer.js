'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

function createServer() {
  const server = new http.Server();
  const dbPath = path.join(__dirname, 'db', 'expense.json');
  const formPath = path.join(__dirname, 'index.html');

  server.on('request', (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      // Повертаємо HTML-форму
      fs.readFile(formPath, 'utf-8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const data = parse(body);

        // Перевірка наявності всіх полів
        if (!data.date || !data.title || !data.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing required fields');

          return;
        }

        // Зчитуємо існуючі дані
        let expenses = [];

        if (fs.existsSync(dbPath)) {
          const fileData = fs.readFileSync(dbPath, 'utf-8');

          expenses = JSON.parse(fileData);
        }

        // Додаємо новий об'єкт
        expenses.push({
          date: data.date,
          title: data.title,
          amount: data.amount,
        });

        // Зберігаємо у файл
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        fs.writeFileSync(dbPath, JSON.stringify(expenses, null, 2));

        // Повертаємо JSON-відповідь
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expenses, null, 2));
      });
    } else {
      // Обробка інших маршрутів
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.on('error', () => {
    // console.error('Server has been crashed');
  });

  return server;
}

module.exports = {
  createServer,
};
