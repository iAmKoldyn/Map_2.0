import { PrismaClient } from '@prisma/client';
import { PlaceSchema } from '../utils/zodSchemas';
import { z } from 'zod';

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

  async getPlaceById(id: number) {
    return this.prisma.place.findUnique({
      where: { id },
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

  async updatePlace(id: number, data: Partial<z.infer<typeof PlaceSchema>>) {
    return this.prisma.place.update({
      where: { id },
      data,
      include: {
        reviews: true,
        taxis: true,
      },
    });
  }

  async deletePlace(id: number) {
    return this.prisma.place.delete({
      where: { id },
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
