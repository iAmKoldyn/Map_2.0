import { Request, Response, NextFunction } from 'express';
import { TRPCError } from '@trpc/server';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof TRPCError) {
    return res.status(400).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.cause
      }
    });
  }

  res.status(err.statusCode || 500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal Server Error'
    }
  });
}; 