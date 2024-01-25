/* eslint-disable max-len */
'use strict';

const { createServer } = require('../src/createServer.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Server } = require('http');

const PORT = 5701;
const HOST = `http://localhost:${PORT}`;

describe('Form Data Server', () => {
  describe('createServer', () => {
    describe('basic scenarios', () => {
      it('should create a server', () => {
        expect(createServer)
          .toBeInstanceOf(Function);
      });

      it('should create an instance of Server', async() => {
        expect(createServer())
          .toBeInstanceOf(Server);
      });
    });

    describe('Server', () => {
      let server;

      const dataPath = path.resolve(__dirname, '../db/expense.json');

      beforeEach(() => {
        server = createServer();
        server.listen(PORT);

        fs.writeFileSync(dataPath, JSON.stringify({}));
      });

      afterEach(() => {
        server.close();
      });

      it('should return a form on "GET /" request', async() => {
        const response = await axios.get(`${HOST}/`);

        expect(response.status).toBe(200);
        expect(response.data).toContain('<form');
      });

      it('should save data for valid expense on "POST /submit-expense" request', async() => {
        const expense = {
          date: '2024-01-25',
          title: 'Test Expense',
          amount: '100',
        };
        const response = await axios.post(`${HOST}/add-expense`, expense);

        expect(response.status).toBe(200);
        expect(fs.existsSync(dataPath)).toBe(true);

        const savedData = JSON.parse(fs.readFileSync(dataPath));

        Object.entries(expense).forEach(([key, value]) => {
          expect(savedData[key]).toBe(value);
        });
      });

      it('should reject request without all params on "POST /submit-expense" request', async() => {
        const expense = {
          title: 'Invalid Expense',
          amount: '100',
        };

        expect.assertions(2);

        try {
          await axios.post(`${HOST}/add-expense`, expense);
        } catch (err) {
          expect(err.response.data.length).toBeGreaterThan(0);

          expect(
            JSON.parse(fs.readFileSync(dataPath))
          ).toStrictEqual({});
        }
      });

      it('"POST /submit-expense should return JSON', async() => {
        const expense = {
          date: '2024-01-25',
          title: 'Test Expense',
          amount: '100',
        };
        const response = await axios.post(`${HOST}/add-expense`, expense);

        expect(response.data).toStrictEqual(expense);
        expect(response.headers['content-type']).toBe('application/json');
      });

      test('should return 404 for invalid url', async() => {
        expect.assertions(1);

        try {
          await axios.get(`${HOST}/invalid-url`);
        } catch (err) {
          expect(err.response.status).toBe(404);
        }
      });
    });
  });
});
