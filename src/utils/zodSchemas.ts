import { z } from 'zod';

/**
 * Common schema for validating numeric IDs passed via tRPC routes.
 * Coerces the input to a number and ensures it is a positive integer.
 */
export const IdSchema = z.coerce
  .number()
  .int()
  .positive()
  .refine((val) => !Number.isNaN(val), {
    message: 'ID must be a valid number',
  });

export const PlaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export const ReviewSchema = z.object({
  content: z.string().min(1, 'Review content is required'),
  rating: z.number().min(1).max(5),
  author: z.string().optional(),
  placeId: z.number(),
  userId: z.number(),
});

export const TaxiSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
  isAvailable: z.boolean().optional(),
  places: z
    .object({
      connect: z.array(
        z.object({
          id: z.number(),
        })
      ),
    })
    .optional(),
});
