import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { PlaceSchema } from '../utils/zodSchemas';
import { PlaceService } from '../services/placeService';
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

/**
 * @swagger
 * tags:
 *   name: Places
 *   description: Place management endpoints
 */

export const placeRouter = router({
  /**
   * @swagger
   * /trpc/place.getAll:
   *   get:
   *     summary: Get all places
   *     tags: [Places]
   *     responses:
   *       200:
   *         description: List of places
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Place'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const placeService = new PlaceService(ctx.prisma);
    return placeService.getAllPlaces();
  }),

  /**
   * @swagger
   * /trpc/place.getById:
   *   get:
   *     summary: Get a place by ID
   *     tags: [Places]
   *     parameters:
   *       - in: query
   *         name: input
   *         required: true
   *         schema:
   *           type: integer
   *         description: Place ID
   *     responses:
   *       200:
   *         description: Place details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Place'
   *       404:
   *         description: Place not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getById: publicProcedure
    .input(
      z.union([
        z.number().int().positive(),
        z.string().transform((val) => {
          const num = Number(val);
          if (isNaN(num)) throw new Error('ID must be a valid number');
          return num;
        }),
        z
          .object({
            id: z.union([
              z.number().int().positive(),
              z.string().transform((val) => {
                const num = Number(val);
                if (isNaN(num)) throw new Error('ID must be a valid number');
                return num;
              }),
            ]),
          })
          .transform((val) => val.id),
      ])
    )
    .query(async ({ ctx, input }) => {
      try {
        console.log('getById input:', input);

        if (!input) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID is required',
          });
        }

        const placeService = new PlaceService(ctx.prisma);
        const place = await placeService.getPlaceById(input);

        if (!place) {
          console.log('Place not found for id:', input);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Place not found',
          });
        }

        console.log('Found place:', place);
        return place;
      } catch (error) {
        console.error('Error in getById:', {
          error,
          input,
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get place',
          cause: error,
        });
      }
    }),

  /**
   * @swagger
   * /trpc/place.create:
   *   post:
   *     summary: Create a new place
   *     tags: [Places]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - latitude
   *               - longitude
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               latitude:
   *                 type: number
   *                 format: float
   *               longitude:
   *                 type: number
   *                 format: float
   *               address:
   *                 type: string
   *               city:
   *                 type: string
   *               country:
   *                 type: string
   *               category:
   *                 type: string
   *               imageUrl:
   *                 type: string
   *               website:
   *                 type: string
   *               phone:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       201:
   *         description: Place created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Place'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  create: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(PlaceSchema)
    .mutation(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.createPlace(input);
    }),

  /**
   * @swagger
   * /trpc/place.update:
   *   put:
   *     summary: Update a place
   *     tags: [Places]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *               - data
   *             properties:
   *               id:
   *                 type: integer
   *               data:
   *                 type: object
   *                 properties:
   *                   name:
   *                     type: string
   *                   description:
   *                     type: string
   *                   latitude:
   *                     type: number
   *                     format: float
   *                   longitude:
   *                     type: number
   *                     format: float
   *                   address:
   *                     type: string
   *                   city:
   *                     type: string
   *                   country:
   *                     type: string
   *                   category:
   *                     type: string
   *                   imageUrl:
   *                     type: string
   *                   website:
   *                     type: string
   *                   phone:
   *                     type: string
   *                   email:
   *                     type: string
   *     responses:
   *       200:
   *         description: Place updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Place'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Place not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  update: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(
      z.object({
        id: z.number(),
        data: PlaceSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.updatePlace(input.id, input.data);
    }),

  /**
   * @swagger
   * /trpc/place.delete:
   *   delete:
   *     summary: Delete a place
   *     tags: [Places]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: input
   *         required: true
   *         schema:
   *           type: integer
   *         description: Place ID
   *     responses:
   *       200:
   *         description: Place deleted successfully
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Place not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(
      z
        .number()
        .int()
        .positive()
        .refine((val) => !isNaN(val), {
          message: 'ID must be a valid number',
        })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log('delete input:', input);

        if (!input) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID is required',
          });
        }

        const placeService = new PlaceService(ctx.prisma);
        const place = await placeService.getPlaceById(input);

        if (!place) {
          console.log('Place not found for id:', input);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Place not found',
          });
        }

        return placeService.deletePlace(input);
      } catch (error) {
        console.error('Error in delete:', {
          error,
          input,
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete place',
          cause: error,
        });
      }
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const placeService = new PlaceService(ctx.prisma);
      return placeService.searchPlaces(input.query, input.category);
    }),
});
