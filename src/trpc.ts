import { initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { prisma } from './prisma';

export type Context = {
  prisma: typeof prisma;
};

export const createContext = async (opts: CreateNextContextOptions): Promise<Context> => {
  return {
    prisma,
  };
};

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createTRPCRouter = t.router; 