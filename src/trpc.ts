import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { prisma } from './prisma';
import { UserRole } from './middleware/authMiddleware';
import { verifyToken } from './utils/jwt';

export interface Context {
  prisma: typeof prisma;
  user?: {
    id: number;
    email: string;
    role: UserRole;
  } | null;
}

export const createContext = async ({ req }: CreateExpressContextOptions): Promise<Context> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return { prisma, user: null };
    }

    const decoded = verifyToken(token);
    return {
      prisma,
      user: decoded,
    };
  } catch (error) {
    return { prisma, user: null };
  }
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const isAdmin = middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== UserRole.ADMIN) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Not authorized',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);

export const createTRPCRouter = t.router; 