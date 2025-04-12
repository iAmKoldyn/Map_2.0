import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ReviewSchema } from '../utils/zodSchemas';

const prisma = new PrismaClient();

export class ReviewService {
  async getAllReviews() {
    return prisma.review.findMany({
      include: {
        place: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async getReviewById(id: number) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        place: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
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

  async createReview(data: typeof ReviewSchema._type) {
    return prisma.review.create({
      data: {
        content: data.content,
        rating: data.rating,
        author: data.author,
        placeId: data.placeId,
        userId: data.userId
      },
      include: {
        place: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async updateReview(id: number, data: Partial<typeof ReviewSchema._type>) {
    try {
      return prisma.review.update({
        where: { id },
        data: {
          content: data.content,
          rating: data.rating,
          author: data.author,
          placeId: data.placeId,
          userId: data.userId
        },
        include: {
          place: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found'
      });
    }
  }

  async deleteReview(id: number) {
    try {
      return prisma.review.delete({
        where: { id }
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found'
      });
    }
  }

  async getByPlace(placeId: number) {
    return prisma.review.findMany({
      where: { placeId },
      include: {
        place: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async getAverageRating(placeId: number) {
    const result = await prisma.review.aggregate({
      where: { placeId },
      _avg: {
        rating: true
      }
    });
    return result._avg.rating;
  }
} 