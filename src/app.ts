import express from 'express';
import cors from 'cors';
import { createContext } from './trpc';
import { appRouter } from './routers';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { config } from './config/index';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// tRPC middleware mounted at "/trpc"
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      console.error('tRPC error:', error);
      if (error.code === 'BAD_REQUEST') {
        throw error;
      }
    },
    batching: {
      enabled: false
    }
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

// Start the server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
}); 