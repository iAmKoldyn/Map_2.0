import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { ReviewSchema } from '../utils/zodSchemas';
import { ReviewService } from '../services/reviewService';
import { Context } from '../trpc';

const reviewService = new ReviewService();

const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Not authenticated');
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const reviewRouter = router({
  getAll: publicProcedure.query(() => {
    return reviewService.getAllReviews();
  }),

  getById: publicProcedure
    .input(z.number())
    .query(({ input }) => {
      return reviewService.getReviewById(input);
    }),

  create: publicProcedure
    .use(isAuthenticated)
    .input(ReviewSchema)
    .mutation(({ input, ctx }) => {
      return reviewService.createReview({
        ...input,
        userId: ctx.user.id
      });
    }),

  update: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      id: z.number(),
      data: ReviewSchema.partial()
    }))
    .mutation(({ input, ctx }) => {
      return reviewService.updateReview(input.id, {
        ...input.data,
        userId: ctx.user.id
      });
    }),

  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.number())
    .mutation(({ input }) => {
      return reviewService.deleteReview(input);
    }),

  getByPlace: publicProcedure
    .input(z.number())
    .query(({ input }) => {
      return reviewService.getByPlace(input);
    }),

  getAverageRating: publicProcedure
    .input(z.object({ placeId: z.number() }))
    .query(async ({ input }) => {
      try {
        return await reviewService.getAverageRating(input.placeId);
      } catch (error) {
        throw new Error('Failed to get average rating');
      }
    })
}); 