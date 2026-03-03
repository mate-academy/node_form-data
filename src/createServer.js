'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Обробляємо тільки POST /add-expense
    if (url.pathname === '/add-expense' && req.method === 'POST') {
      const chunks = [];

      try {
        for await (const chunk of req) {
          chunks.push(chunk);
        }

        const body = Buffer.concat(chunks).toString();
        const expense = JSON.parse(body);

        // ВАЛІДАЦІЯ: перевіряємо наявність усіх полів
        if (!expense.date || !expense.title || !expense.amount) {
          res.statusCode = 400; // Або інший код помилки

          return res.end('Missing required fields');
        }

        // ЗБЕРЕЖЕННЯ: перезаписуємо файл згідно з тестом
        fs.writeFileSync(dataPath, JSON.stringify(expense));

        // ВІДПОВІДЬ: JSON формат
        res.setHeader('Content-Type', 'application/json');

        return res.end(JSON.stringify(expense));
      } catch (err) {
        res.statusCode = 400;

        return res.end('Invalid JSON');
      }
    }

    // Всі інші маршрути — 404
    res.statusCode = 404;
    res.end('Not Found');
  });
}

module.exports = { createServer };
