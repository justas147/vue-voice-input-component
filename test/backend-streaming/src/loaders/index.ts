import express from "express";
import SocketLoader from "./sockets";
import ExpressLoader from "./express";
import http from "http";

export const Loaders = (
  { app, 
    server 
  }: { 
    app: express.Application,
    server: http.Server
  },
): void => {
  ExpressLoader({ app });
  SocketLoader({ server });
};
