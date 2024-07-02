import express from 'express';
import dotenv from "dotenv";
import http from "http";
import { Loaders } from "./loaders";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = () => {
  const app = express();
  const server = http.createServer(app);

  server.setMaxListeners(25);

  server.listen(PORT, () => {
    console.info(`Server listening on port: ${PORT}`);
  });

  Loaders({ app, server });
};

startServer();
