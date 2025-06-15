import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { TaxiSchema } from '../utils/zodSchemas';
import { TaxiService } from '../services/taxiService';
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

/**
 * @swagger
 * tags:
 *   name: Taxis
 *   description: Taxi management endpoints
 */

export const taxiRouter = router({
  /**
   * @swagger
   * /trpc/taxi.getAll:
   *   get:
   *     summary: Get all taxis
   *     tags: [Taxis]
   *     responses:
   *       200:
   *         description: List of taxis
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Taxi'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const taxiService = new TaxiService(ctx.prisma);
      return await taxiService.getAllTaxis();
    } catch (error) {
      console.error('Error in taxi.getAll:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch taxis',
        cause: error,
      });
    }
  }),

  /**
   * @swagger
   * /trpc/taxi.getById:
   *   get:
   *     summary: Get a taxi by ID
   *     tags: [Taxis]
   *     parameters:
   *       - in: query
   *         name: input
   *         required: true
   *         schema:
   *           type: integer
   *         description: Taxi ID
   *     responses:
   *       200:
   *         description: Taxi details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Taxi'
   *       404:
   *         description: Taxi not found
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
      z.object({
        id: z.coerce.number().int().positive().refine((val) => !isNaN(val), {
          message: 'ID must be a valid number',
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const taxiService = new TaxiService(ctx.prisma);
        const taxi = await taxiService.getTaxiById(input.id);
        if (!taxi) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Taxi not found',
          });
        }
        return taxi;
      } catch (error) {
        console.error('Error in taxi.getById:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch taxi',
          cause: error,
        });
      }
    }),

  /**
   * @swagger
   * /trpc/taxi.create:
   *   post:
   *     summary: Create a new taxi
   *     tags: [Taxis]
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
   *               - phone
   *               - available
   *               - carModel
   *               - licensePlate
   *               - driverName
   *             properties:
   *               name:
   *                 type: string
   *               phone:
   *                 type: string
   *               available:
   *                 type: boolean
   *               carModel:
   *                 type: string
   *               licensePlate:
   *                 type: string
   *               driverName:
   *                 type: string
   *               rating:
   *                 type: number
   *                 format: float
   *               currentLocation:
   *                 type: object
   *                 properties:
   *                   latitude:
   *                     type: number
   *                     format: float
   *                   longitude:
   *                     type: number
   *                     format: float
   *               features:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Taxi created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Taxi'
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
    .input(TaxiSchema)
    .mutation(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.createTaxi(input);
    }),

  /**
   * @swagger
   * /trpc/taxi.update:
   *   put:
   *     summary: Update a taxi
   *     tags: [Taxis]
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
   *                   phone:
   *                     type: string
   *                   available:
   *                     type: boolean
   *                   carModel:
   *                     type: string
   *                   licensePlate:
   *                     type: string
   *                   driverName:
   *                     type: string
   *                   rating:
   *                     type: number
   *                     format: float
   *                   currentLocation:
   *                     type: object
   *                     properties:
   *                       latitude:
   *                         type: number
   *                         format: float
   *                       longitude:
   *                         type: number
   *                         format: float
   *                   features:
   *                     type: array
   *                     items:
   *                       type: string
   *     responses:
   *       200:
   *         description: Taxi updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Taxi'
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
   *         description: Taxi not found
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
        data: TaxiSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.updateTaxi(input.id, input.data);
    }),

  /**
   * @swagger
   * /trpc/taxi.delete:
   *   delete:
   *     summary: Delete a taxi
   *     tags: [Taxis]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: input
   *         required: true
   *         schema:
   *           type: integer
   *         description: Taxi ID
   *     responses:
   *       200:
   *         description: Taxi deleted successfully
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
   *         description: Taxi not found
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
      z.object({
        id: z.coerce.number().int().positive().refine((val) => !isNaN(val), {
          message: 'ID must be a valid number',
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.deleteTaxi(input.id);
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        available: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const taxiService = new TaxiService(ctx.prisma);
      return taxiService.searchTaxis(input.query, input.available);
    }),
});
