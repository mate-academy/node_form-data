"use strict";

const { Server } = require("http");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const server = new Server();

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

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(formData));
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
