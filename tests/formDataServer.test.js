/* eslint-disable max-len */
'use strict';

const { createServer } = require('../src/createServer.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Server, Agent } = require('http');

// this prevents `socket hang up` for Node.js 20.10+
axios.defaults.httpAgent = new Agent({ keepAlive: false });

const PORT = 5701;
const HOST = `http://localhost:${PORT}`;

describe('Form Data Server', () => {
  describe('createServer', () => {
    describe('basic scenarios', () => {
      it('should create a server', () => {
        expect(createServer).toBeInstanceOf(Function);
      });

      it('should create an instance of Server', async () => {
        expect(createServer()).toBeInstanceOf(Server);
      });
    });

    describe('Server', () => {
      let server;

      const dataPath = path.resolve(__dirname, '../db/expense.json');

      beforeEach(() => {
        server = createServer();
        server.listen(PORT);
      });

      afterEach(() => {
        server.close();
      });

      it('should save data for valid expense on "POST /submit-expense" request', async () => {
        fs.writeFileSync(dataPath, JSON.stringify({}));

        const expense = {
          date: '2024-01-25',
          title: 'Test Expense',
          amount: '100',
        };
        const response = await axios.post(`${HOST}/add-expense`, expense);

        expect(response.status).toBe(200);

        const savedData = JSON.parse(fs.readFileSync(dataPath));

        expect(savedData).toStrictEqual(expense);
      });

      it('should reject request without all params on "POST /submit-expense" request', async () => {
        fs.writeFileSync(dataPath, JSON.stringify({}));

        const expense = {
          title: 'Invalid Expense',
          amount: '100',
        };

        expect.assertions(2);

        try {
          await axios.post(`${HOST}/add-expense`, expense);
        } catch (err) {
          expect(err.response.data.length).toBeGreaterThan(0);

          expect(JSON.parse(fs.readFileSync(dataPath))).toStrictEqual({});
        }
      });

      it('should return JSON on "POST /submit-expense" request', async () => {
        const expense = {
          date: '2024-01-25',
          title: 'Test Expense',
          amount: '100',
        };
        const response = await axios.post(`${HOST}/add-expense`, expense);

        expect(response.headers['content-type']).toBe('application/json');
        expect(response.data).toStrictEqual(expense);
      });

      it('should return 404 for invalid url', async () => {
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
