import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  if (req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
};
