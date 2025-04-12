import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ReviewSchema } from '../utils/zodSchemas';

const prisma = new PrismaClient();

export class ReviewService {
  static async getAll() {
    return await prisma.review.findMany({
      include: {
        place: true
      }
    });
  }

  static async getById(id: number) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        place: true
      }
    });

    if (!review) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found'
      });
    }

    return review;
  }

  static async create(data: z.infer<typeof ReviewSchema>) {
    return await prisma.review.create({
      data,
      include: {
        place: true
      }
    });
  }

  static async update(id: number, data: z.infer<typeof ReviewSchema>) {
    try {
      return await prisma.review.update({
        where: { id },
        data,
        include: {
          place: true
        }
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found'
      });
    }
  }

  static async delete(id: number) {
    try {
      return await prisma.review.delete({
        where: { id }
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found'
      });
    }
  }

  static async getByPlace(placeId: number) {
    return await prisma.review.findMany({
      where: {
        placeId
      },
      include: {
        place: true
      }
    });
  }

  static async getAverageRating(placeId: number) {
    const result = await prisma.review.aggregate({
      where: { placeId },
      _avg: {
        rating: true
      }
    });
    return result._avg.rating;
  }
} 