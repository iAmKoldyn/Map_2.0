import { z } from 'zod';
import { t } from '../trpc';
import { TaxiSchema } from '../utils/zodSchemas';
import { TaxiService } from '../services/taxiService';
import type { Context } from '../trpc';

export const taxiRouter = t.router({
  getAll: t.procedure.query(async () => {
    return TaxiService.getAll();
  }),

  getById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return TaxiService.getById(input.id);
    }),

  create: t.procedure
    .input(TaxiSchema)
    .mutation(async ({ input }) => {
      return TaxiService.create(input);
    }),

  update: t.procedure
    .input(z.object({
      id: z.number(),
      data: TaxiSchema
    }))
    .mutation(async ({ input }) => {
      return TaxiService.update(input.id, input.data);
    }),

  delete: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return TaxiService.delete(input.id);
    }),

  getByPlace: t.procedure
    .input(z.object({ placeId: z.number() }))
    .query(async ({ input }) => {
      return TaxiService.getTaxisByPlace(input.placeId);
    }),
}); 