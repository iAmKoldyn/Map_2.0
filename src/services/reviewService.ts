import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { ReviewSchema } from '../utils/zodSchemas';
import { ensureNumericId } from '../utils/ensureNumericId';

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
            role: true,
          },
        },
      },
    });
  }

  async getReviewById(id: number | string) {
    const numericId = ensureNumericId(id);
    const review = await prisma.review.findUnique({
      where: { id: numericId },
      include: {
        place: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!review) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found',
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
        userId: data.userId,
      },
      include: {
        place: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async updateReview(id: number | string, data: Partial<typeof ReviewSchema._type>) {
    const numericId = ensureNumericId(id);
    try {
      return prisma.review.update({
        where: { id: numericId },
        data: {
          content: data.content,
          rating: data.rating,
          author: data.author,
          placeId: data.placeId,
          userId: data.userId,
        },
        include: {
          place: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found',
      });
    }
  }

  async deleteReview(id: number | string) {
    const numericId = ensureNumericId(id);
    try {
      return prisma.review.delete({
        where: { id: numericId },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found',
      });
    }
  }

  async getByPlace(placeId: number | string) {
    const numericId = ensureNumericId(placeId);
    return prisma.review.findMany({
      where: { placeId: numericId },
      include: {
        place: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getAverageRating(placeId: number | string) {
    const numericId = ensureNumericId(placeId);
    const result = await prisma.review.aggregate({
      where: { placeId: numericId },
      _avg: {
        rating: true,
      },
    });
    return result._avg.rating;
  }
}
