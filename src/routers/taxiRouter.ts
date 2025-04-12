import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { TaxiSchema } from '../utils/zodSchemas';
import { TaxiService } from '../services/taxiService';
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

export const taxiRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const taxiService = new TaxiService(ctx.prisma);
    return taxiService.getAllTaxis();
  }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.getTaxiById(input);
    }),

  create: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(TaxiSchema)
    .mutation(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.createTaxi(input);
    }),

  update: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(z.object({
      id: z.number(),
      data: TaxiSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.updateTaxi(input.id, input.data);
    }),

  delete: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.deleteTaxi(input);
    }),

  search: publicProcedure
    .input(z.object({
      query: z.string(),
      available: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.searchTaxis(input.query, input.available);
    }),
}); 