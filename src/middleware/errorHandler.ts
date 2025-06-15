import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: (err as unknown as { [key: string]: unknown }).code,
    name: err.name,
  });

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      error: {
        code: err.code,
        message: err.message,
        meta: err.meta,
      },
    });
  }

  // Handle tRPC errors
  if (err instanceof TRPCError) {
    return res.status(400).json({
      error: {
        code: err.code,
        message: err.message,
        cause: err.cause,
      },
    });
  }

  // Handle validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        issues: err.errors,
      },
    });
  }

  // Handle other errors
  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  return res.status(statusCode).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
