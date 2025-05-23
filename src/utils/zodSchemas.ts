import { z } from 'zod';

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
