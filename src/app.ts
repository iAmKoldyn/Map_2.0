import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routers/appRouter';
import { createContext } from './context/context';
import config from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger);

// tRPC middleware mounted at "/trpc"
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Travel Service API is running.');
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 