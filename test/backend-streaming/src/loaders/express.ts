import express from "express";
import { HandleErrorProps } from "../core/types/Error";
import { handleError, HttpError } from "../core/errorHandler";

const ExpressLoader = ({ app }: { app: express.Application }): void => {
  // Health Check
  app.get("/status", (req, res) => {
    res.status(200).end();
  });

  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  // 404 error handler
  app.use((req, res, next) => {
    throw new HttpError(404, 'Not Found');
  });

  // Error handlers
  app.use((err: any, req: any, res: any, next: any) => {
    handleError({ err, res } as HandleErrorProps);
  });
};

export default ExpressLoader;
