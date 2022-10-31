'use strict';

const fs = require('fs');
const http = require('http');

const PORT = 8000;

const server = new http.Server();

server.on('request', async(request, response) => {
  // Get Styles:
  if (request.url === '/src/public/main.css' && request.method === 'GET') {
    const styles = fs.readFileSync('src/public/main.css');

    response.setHeader('Content-Type', 'text/css');
    response.end(styles);

    return;
  }

  // Get all expenses:
  if (request.url === '/expense' && request.method === 'GET') {
    response.end(fs.readFileSync('src/data.json', 'utf-8'));
  }

  // Get index.html:
  if (request.url === '/' && request.method === 'GET') {
    const file = fs.createReadStream('src/public/index.html');

    response.setHeader('Content-Type', 'text/html');
    file.pipe(response);
  }

  // Get data from form and process it:
  if (request.url === '/send' && request.method === 'POST') {
    const chunks = [];

    // get all chunks of data from the stream:
    for await (const chunk of request) {
      chunks.push(chunk);
    }

    // - Convert buffer to concated string
    // |-- and then convert it into array like [key, value]:
    const formattedData = {};
    const buffer = Buffer.concat(chunks).toString();

    buffer
      .split('&')
      .map(field => field.split('='))
      .forEach(field => {
        formattedData[field[0]] = field[1];
      });

    // Get current data from the json file and parse it to JS's obj:
    const currentData = fs.readFileSync('src/data.json', 'utf-8');
    const updatedData = JSON.parse(currentData);

    // Add new data to obj:
    updatedData.expense.push(formattedData);

    // Write an updated data back to file:
    fs.writeFileSync('src/data.json', (
      JSON.stringify(updatedData, null, 4))
    );

    // Send an updated data back to user:
    response.setHeader('Content-Type', 'text/plain');
    response.end(JSON.stringify(updatedData, null, 4));
  }
});

server.listen(PORT);
