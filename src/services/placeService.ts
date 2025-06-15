import { PrismaClient } from '@prisma/client';
import { PlaceSchema } from '../utils/zodSchemas';
import { z } from 'zod';
import { ensureNumericId } from '../utils/ensureNumericId';

export class PlaceService {
  constructor(private prisma: PrismaClient) {}

  async getAllPlaces() {
    return this.prisma.place.findMany({
      include: {
        reviews: true,
        taxis: true,
      },
    });
  }

  async getPlaceById(id: number | string) {
    const numericId = ensureNumericId(id);
    return this.prisma.place.findUnique({
      where: { id: numericId },
      include: {
        reviews: true,
        taxis: true,
      },
    });
  }

  async createPlace(data: z.infer<typeof PlaceSchema>) {
    return this.prisma.place.create({
      data,
      include: {
        reviews: true,
        taxis: true,
      },
    });
  }

  async updatePlace(id: number | string, data: Partial<z.infer<typeof PlaceSchema>>) {
    const numericId = ensureNumericId(id);
    return this.prisma.place.update({
      where: { id: numericId },
      data,
      include: {
        reviews: true,
        taxis: true,
      },
    });
  }

  async deletePlace(id: number | string) {
    const numericId = ensureNumericId(id);
    return this.prisma.place.delete({
      where: { id: numericId },
    });
  }

  async searchPlaces(query: string, category?: string) {
    return this.prisma.place.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        ...(category ? { category } : {}),
      },
      include: {
        reviews: true,
        taxis: true,
      },
    });
  }
}
