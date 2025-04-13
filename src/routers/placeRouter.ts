import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { PlaceSchema } from '../utils/zodSchemas';
import { PlaceService } from '../services/placeService';
import { Context } from '../trpc';
import { TRPCError } from '@trpc/server';

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
    .input(z.union([
      z.number().int().positive(),
      z.string().transform((val) => {
        const num = Number(val);
        if (isNaN(num)) throw new Error('ID must be a valid number');
        return num;
      }),
      z.object({
        id: z.union([
          z.number().int().positive(),
          z.string().transform((val) => {
            const num = Number(val);
            if (isNaN(num)) throw new Error('ID must be a valid number');
            return num;
          })
        ])
      }).transform(val => val.id)
    ]))
    .query(async ({ ctx, input }) => {
      try {
        console.log('getById input:', input);
        
        if (!input) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID is required'
          });
        }

        const placeService = new PlaceService(ctx.prisma);
        const place = await placeService.getPlaceById(input);
        
        if (!place) {
          console.log('Place not found for id:', input);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Place not found'
          });
        }
        
        console.log('Found place:', place);
        return place;
      } catch (error) {
        console.error('Error in getById:', {
          error,
          input,
          stack: error instanceof Error ? error.stack : undefined
        });
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get place',
          cause: error
        });
      }
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
    .input(z.number()
      .int()
      .positive()
      .refine((val) => !isNaN(val), {
        message: "ID must be a valid number"
      }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log('delete input:', input);
        
        if (!input) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID is required'
          });
        }

        const placeService = new PlaceService(ctx.prisma);
        const place = await placeService.getPlaceById(input);
        
        if (!place) {
          console.log('Place not found for id:', input);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Place not found'
          });
        }

        return placeService.deletePlace(input);
      } catch (error) {
        console.error('Error in delete:', {
          error,
          input,
          stack: error instanceof Error ? error.stack : undefined
        });
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete place',
          cause: error
        });
      }
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