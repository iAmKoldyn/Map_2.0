import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { TaxiSchema } from '../utils/zodSchemas';

const prisma = new PrismaClient();

export class TaxiService {
  static async getAll() {
    return await prisma.taxi.findMany({
      include: {
        places: true
      }
    });
  }

  static async getById(id: number) {
    const taxi = await prisma.taxi.findUnique({
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

  static async create(data: z.infer<typeof TaxiSchema>) {
    return await prisma.taxi.create({
      data,
      include: {
        places: true
      }
    });
  }

  static async update(id: number, data: z.infer<typeof TaxiSchema>) {
    try {
      return await prisma.taxi.update({
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

  static async delete(id: number) {
    try {
      return await prisma.taxi.delete({
        where: { id }
      });
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Taxi not found'
      });
    }
  }

  static async getTaxisByPlace(placeId: number) {
    return prisma.taxi.findMany({
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