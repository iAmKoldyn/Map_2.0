import { createTRPCRouter } from '../trpc';
import { placeRouter } from './placeRouter';
import { taxiRouter } from './taxiRouter';
import { reviewRouter } from './reviewRouter';
import { authRouter } from './authRouter';

export const appRouter = createTRPCRouter({
  place: placeRouter,
  taxi: taxiRouter,
  review: reviewRouter,
  auth: authRouter
});

export type AppRouter = typeof appRouter; 