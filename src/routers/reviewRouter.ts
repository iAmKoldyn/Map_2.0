import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { ReviewSchema } from '../utils/zodSchemas';
import { ReviewService } from '../services/reviewService';
import { Context } from '../trpc';
import { TRPCError } from '@trpc/server';

const reviewService = new ReviewService();

const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const reviewRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      return await reviewService.getAllReviews();
    } catch (error) {
      console.error('Error in getAll:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get reviews',
        cause: error
      });
    }
  }),

  getById: publicProcedure
    .input(z.object({ 
      id: z.coerce.number()
        .int()
        .positive()
        .refine((val) => !isNaN(val), {
          message: "ID must be a valid number"
        })
    }))
    .query(async ({ input }) => {
      try {
        console.log('getById input:', input);
        
        if (!input.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID is required'
          });
        }

        const review = await reviewService.getReviewById(input.id);
        
        if (!review) {
          console.log('Review not found for id:', input.id);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Review not found'
          });
        }
        
        console.log('Found review:', review);
        return review;
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
          message: 'Failed to get review',
          cause: error
        });
      }
    }),

  create: publicProcedure
    .use(isAuthenticated)
    .input(ReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID is required'
          });
        }
        return await reviewService.createReview({
          ...input,
          userId: ctx.user.id
        });
      } catch (error) {
        console.error('Error in create:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create review',
          cause: error
        });
      }
    }),

  update: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      id: z.number()
        .int()
        .positive()
        .refine((val) => !isNaN(val), {
          message: "ID must be a valid number"
        }),
      data: ReviewSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID is required'
          });
        }
        return await reviewService.updateReview(input.id, {
          ...input.data,
          userId: ctx.user.id
        });
      } catch (error) {
        console.error('Error in update:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update review',
          cause: error
        });
      }
    }),

  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.number()
      .int()
      .positive()
      .refine((val) => !isNaN(val), {
        message: "ID must be a valid number"
      }))
    .mutation(async ({ input }) => {
      try {
        console.log('delete input:', input);
        
        if (!input) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID is required'
          });
        }

        const review = await reviewService.getReviewById(input);
        
        if (!review) {
          console.log('Review not found for id:', input);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Review not found'
          });
        }

        return await reviewService.deleteReview(input);
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
          message: 'Failed to delete review',
          cause: error
        });
      }
    }),

  getByPlace: publicProcedure
    .input(z.object({ 
      placeId: z.coerce.number()
        .int()
        .positive()
        .refine((val) => !isNaN(val), {
          message: "Place ID must be a valid number"
        })
    }))
    .query(async ({ input }) => {
      try {
        return await reviewService.getByPlace(input.placeId);
      } catch (error) {
        console.error('Error in getByPlace:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get reviews by place',
          cause: error
        });
      }
    }),

  getAverageRating: publicProcedure
    .input(z.object({ 
      placeId: z.coerce.number()
        .int()
        .positive()
        .refine((val) => !isNaN(val), {
          message: "Place ID must be a valid number"
        })
    }))
    .query(async ({ input }) => {
      try {
        return await reviewService.getAverageRating(input.placeId);
      } catch (error) {
        console.error('Error in getAverageRating:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get average rating',
          cause: error
        });
      }
    })
}); 