'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

/**
 * Creates an HTTP server that handles expense form submissions.
 * @returns {http.Server} The configured HTTP server.
 */
function createServer() {
  const server = http.createServer((req, res) => {
    // Обробляємо GET-запит на головну сторінку
    if (req.method === 'GET' && req.url === '/') {
      const indexPath = path.join(__dirname, 'index.html');

      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(404, 'Not Found', { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: index.html not found');

          return;
        }
        res.writeHead(200, 'OK', { 'Content-Type': 'text/html' });
        res.end(data);
      });

      return;
    }

    // Обробляємо POST-запит на /add-expense
    if (req.method === 'POST' && req.url === '/add-expense') {
      const form = new formidable.IncomingForm();

      form.parse(req, (err, fields) => {
        if (err) {
          res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
          res.end('400 Bad Request: Error parsing form');

          return;
        }

        // Перевіряємо наявність усіх полів
        const { date, title, amount } = fields;

        if (!date || !title || !amount) {
          res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });

          res.end(
            '400 Bad Request: Missing required fields (date, title, or amount)',
          );

          return;
        }

        // Створюємо об'єкт витрати з amount як рядком
        const expense = {
          date: date.toString(),
          title: title.toString(),
          amount: amount.toString(), // Зберігаємо amount як рядок
        };

        // Шлях до файлу db/expense.json
        const dbPath = path.join(__dirname, '..', 'db', 'expense.json');

        // Зберігаємо одиночний об'єкт, перезаписуючи файл
        try {
          fs.writeFileSync(dbPath, JSON.stringify(expense, null, 2));
        } catch (error) {
          res.writeHead(500, 'Internal Server Error', {
            'Content-Type': 'text/plain',
          });
          res.end('500 Internal Server Error: Error writing to expense.json');

          return;
        }

        // Повертаємо JSON-відповідь
        res.writeHead(200, 'OK', { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense)); // Повертаємо додану витрату
      });

      return;
    }

    // Обробляємо неіснуючі маршрути (404)
    res.writeHead(404, 'Not Found', { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};
