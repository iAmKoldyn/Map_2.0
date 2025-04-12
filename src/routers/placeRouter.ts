import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { PlaceSchema } from '../utils/zodSchemas';
import { PlaceService } from '../services/placeService';
import { Context } from '../trpc';

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

const isAdmin = middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const placeRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const placeService = new PlaceService(ctx.prisma);
    return placeService.getAllPlaces();
  }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.getPlaceById(input);
    }),

  create: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(PlaceSchema)
    .mutation(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.createPlace(input);
    }),

  update: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(z.object({
      id: z.number(),
      data: PlaceSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.updatePlace(input.id, input.data);
    }),

  delete: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.deletePlace(input);
    }),

  search: publicProcedure
    .input(z.object({
      query: z.string(),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.searchPlaces(input.query, input.category);
    }),
}); 