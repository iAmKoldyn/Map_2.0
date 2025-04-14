import express from 'express';
import cors from 'cors';
import { createContext } from './trpc';
import { appRouter } from './routers';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { setupSwagger } from './config/swagger';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Setup Swagger documentation
setupSwagger(app);

// tRPC middleware mounted at "/trpc"
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, type, path, input, ctx, req }) => {
      console.error('tRPC Error Details:', {
        type,
        path,
        input,
        error: {
          code: error.code,
          message: error.message,
          cause: error.cause,
          stack: error.stack,
        },
        context: ctx,
        url: req.url,
      });

      // Handle input validation errors
      if (error.cause instanceof ZodError) {
        console.error('Zod Validation Error:', error.cause.errors);
        return {
          error: {
            code: 'BAD_REQUEST',
            message: 'Input validation failed',
            data: {
              httpStatus: 400,
              issues: error.cause.errors,
              path,
            },
          },
        };
      }

      // Handle other errors
      console.error('Other Error:', error);
      return {
        error: {
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An unexpected error occurred',
          data: {
            httpStatus: error.code === 'NOT_FOUND' ? 404 : 500,
            path,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
          },
        },
      };
    },
  })
);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Travel Service API is running.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use(errorHandler);

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', {
    promise,
    reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', {
    error,
    stack: error.stack,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', {
    error: err,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});
