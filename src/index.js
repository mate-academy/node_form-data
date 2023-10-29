"use strict";

const { Server } = require("http");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const stream = require("stream");

const server = new Server();

if (!fs.existsSync("expenses.json")) {
  fs.writeFileSync("expenses.json", "[]");
}

const renderData = (data) =>
  `<html><body><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;

server.on("request", (req, res) => {
  if (req.method === "POST") {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      const body = Buffer.concat(chunks).toString().split("&");
      const formData = {};

      body.forEach((chunk) => {
        const [key, value] = chunk.split("=");

        formData[key] = value;
      });

      const readStream = fs.createReadStream("expenses.json");
      const existingExpenses = [];
      readStream.on("data", (data) => {
        existingExpenses.push(data);
      });

      readStream.on("error", () => new Error("Failed to read expenses.json!"));

      readStream.on("end", () => {
        const expensesArray = Array.from(JSON.parse(existingExpenses.join("")));

        expensesArray.push(formData);

        const writeStream = fs.createWriteStream("expenses.json");
        const jsonStream = new stream.PassThrough();
        jsonStream.end(JSON.stringify(expensesArray));

        jsonStream
          .on("error", () => new Error("Failed to save data in expenses.json"))
          .pipe(writeStream);

        res.setHeader("Content-Type", "text/html");
        res.end(renderData(expensesArray));
      });
    });

    return;
  }

  const fileStream = fs.createReadStream(path.join(__dirname, "/index.html"));
  const gzip = zlib.createGzip();

  res.setHeader("Content-Encoding", "gzip");

  fileStream
    .on("error", () => new Error("Error reading a file!"))
    .pipe(gzip)
    .on("error", () => new Error("Error compressing a file!"))
    .pipe(res);

  res.on("close", () => {
    fileStream.destroy();
    gzip.destroy();
  });
});

server.listen(3000);
