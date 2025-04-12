import { z } from 'zod';
import { t } from '../trpc';
import { PlaceSchema } from '../utils/zodSchemas';
import { PlaceService } from '../services/placeService';
import type { Context } from '../trpc';

export const placeRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }: { ctx: Context }) => {
    const placeService = new PlaceService(ctx.prisma);
    return placeService.getAllPlaces();
  }),
  getById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }: { input: { id: number }, ctx: Context }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.getPlaceById(input.id);
    }),
  create: t.procedure
    .input(PlaceSchema)
    .mutation(async ({ input, ctx }: { input: z.infer<typeof PlaceSchema>, ctx: Context }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.createPlace(input);
    }),
  update: t.procedure
    .input(z.object({
      id: z.number(),
      data: PlaceSchema.partial(),
    }))
    .mutation(async ({ input, ctx }: { input: { id: number, data: Partial<z.infer<typeof PlaceSchema>> }, ctx: Context }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.updatePlace(input.id, input.data);
    }),
  delete: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }: { input: { id: number }, ctx: Context }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.deletePlace(input.id);
    }),
  search: t.procedure
    .input(z.object({
      query: z.string(),
      category: z.string().optional(),
    }))
    .query(async ({ input, ctx }: { input: { query: string, category?: string }, ctx: Context }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.searchPlaces(input.query, input.category);
    }),
}); 