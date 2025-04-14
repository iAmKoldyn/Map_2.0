import { router } from '../trpc';
import { placeRouter } from './placeRouter';
import { taxiRouter } from './taxiRouter';
import { reviewRouter } from './reviewRouter';

export const appRouter = router({
  place: placeRouter,
  taxi: taxiRouter,
  review: reviewRouter,
});

export type AppRouter = typeof appRouter;
