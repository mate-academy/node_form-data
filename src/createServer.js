'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const pageNotFound = `
<body>
  <nav><a href='/'>HOME</a><nav>
  <h1>404: Page not found</h1>
</body>
`;

const formParams = ['date', 'title', 'amount'];

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.host}`);
    const requestPath = url.pathname.slice(1) || 'index.html';
    const route = req.method + ' ' + requestPath;

    switch (route) {
      case 'GET index.html': {
        const indexPage = getHTMLPage();

        return sendHtmlResponse(res, 200, indexPage);
      }

      case 'POST add-expense': {
        try {
          let formData = {};

          formData = await getPostParameters(req, formParams);

          const formIsValid = !formParams.some((field) => !formData[field]);

          if (formIsValid) {
            const jsonFormData = JSON.stringify(formData, null, 2);

            saveExpenseToFile(jsonFormData);

            const addExpensePage = getHTMLPage(`<pre> ${jsonFormData} </pre>`);

            return sendHtmlResponse(res, 200, addExpensePage);
          } else {
            return sendHtmlResponse(res, 400, 'Form is not valid');
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to add expense:', error);

          const errorMessage = JSON.stringify({
            error: error.message || 'Unknown Server Error',
          });
          const errorPage = await getHTMLPage(`<pre>${errorMessage}</pre>`);

          return sendHtmlResponse(res, 500, errorPage);
        }
      }

      default:
        return sendHtmlResponse(res, 404, pageNotFound);
    }
  });
}

let indexFileContent = '';

function getHTMLPage(content = '') {
  const indexPath = './../public/index.html';
  const fullIndexPath = path.join(__dirname, indexPath);

  if (!indexFileContent) {
    indexFileContent = fs.readFileSync(fullIndexPath).toString();
  }

  if (content) {
    return indexFileContent.replace(/<form[\s\S]*<\/form>/im, content);
  }

  return indexFileContent;
}

async function getPostParameters(req, params) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('end', () => {
      const contentType = req.headers['content-type'];
      const result = {};

      if (!contentType || contentType.includes('application/json')) {
        const jsonData = body ? JSON.parse(body) : {};

        params.forEach((name) => {
          result[name] = jsonData[name] !== undefined ? jsonData[name] : null;
        });

        return resolve(result);
      }

      const formData = new URLSearchParams(body);

      params.forEach((name) => (result[name] = formData.get(name)));

      return resolve(result);
    });
  });
}

function saveExpenseToFile(data) {
  const filePath = './../db/expense.json';
  const fullFilePath = path.join(__dirname, filePath);

  fs.writeFileSync(fullFilePath, data);
}

function sendHtmlResponse(res, code, content) {
  return res
    .writeHead(code, { 'Content-type': 'text/html; charset=utf-8' })
    .end(content);
}

module.exports = {
  createServer,
};
