import { z } from 'zod';
import { t } from '../trpc';
import { ReviewSchema } from '../utils/zodSchemas';
import { ReviewService } from '../services/reviewService';
import type { Context } from '../trpc';

export const reviewRouter = t.router({
  getAll: t.procedure.query(async () => {
    return ReviewService.getAll();
  }),

  getById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return ReviewService.getById(input.id);
    }),

  create: t.procedure
    .input(ReviewSchema)
    .mutation(async ({ input }) => {
      return ReviewService.create(input);
    }),

  update: t.procedure
    .input(z.object({
      id: z.number(),
      data: ReviewSchema
    }))
    .mutation(async ({ input }) => {
      return ReviewService.update(input.id, input.data);
    }),

  delete: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return ReviewService.delete(input.id);
    }),

  getByPlace: t.procedure
    .input(z.object({ placeId: z.number() }))
    .query(async ({ input }) => {
      return ReviewService.getByPlace(input.placeId);
    }),

  getAverageRating: t.procedure
    .input(z.object({ placeId: z.number() }))
    .query(async ({ input }) => {
      return ReviewService.getAverageRating(input.placeId);
    }),
}); 