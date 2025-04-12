import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { TaxiSchema } from '../utils/zodSchemas';

export class TaxiService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllTaxis() {
    return await this.prisma.taxi.findMany({
      include: {
        places: true
      }
    });
  }

  async getTaxiById(id: number) {
    const taxi = await this.prisma.taxi.findUnique({
      where: { id },
      include: {
        places: true
      }
    });

    if (!taxi) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Taxi not found'
      });
    }

    return taxi;
  }

  async createTaxi(data: z.infer<typeof TaxiSchema>) {
    return await this.prisma.taxi.create({
      data,
      include: {
        places: true
      }
    });
  }

  async updateTaxi(id: number, data: Partial<z.infer<typeof TaxiSchema>>) {
    try {
      return await this.prisma.taxi.update({
        where: { id },
        data,
        include: {
          places: true
        }
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Taxi not found'
      });
    }
  }

  async deleteTaxi(id: number) {
    try {
      return await this.prisma.taxi.delete({
        where: { id }
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Taxi not found'
      });
    }
  }

  async searchTaxis(query: string, available?: boolean) {
    return this.prisma.taxi.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } }
        ],
        ...(available !== undefined ? { isAvailable: available } : {})
      },
      include: {
        places: true
      }
    });
  }

  async getTaxisByPlace(placeId: number) {
    return this.prisma.taxi.findMany({
      where: {
        places: {
          some: {
            id: placeId,
          },
        },
      },
      include: {
        places: true,
      },
    });
  }
} 