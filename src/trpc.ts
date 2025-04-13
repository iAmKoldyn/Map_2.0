import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { prisma } from './prisma';
import { UserRole } from './middleware/authMiddleware';
import { verifyToken } from './utils/jwt';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

export interface Context {
  prisma: PrismaClient;
  req?: Request;
  res?: Response;
  user?: {
    id: number;
    email: string;
    role: 'ADMIN' | 'USER';
  } | null;
}

type ErrorData = {
  zodError?: ReturnType<ZodError['flatten']>;
  user?: Context['user'];
  [key: string]: unknown;
};

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

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Error handling middleware
const errorHandler = t.middleware(async ({ path, type, next }) => {
  try {
    return await next();
  } catch (error) {
    // Log the error
    console.error('tRPC error:', {
      path,
      type,
      error,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle known error types
    if (error instanceof TRPCError) {
      throw error;
    }

    if (error instanceof ZodError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid input data',
        cause: error
      });
    }

    // Handle unknown errors
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      cause: error
    });
  }
});

// Create middleware to handle authentication
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  try {
    const token = ctx.req?.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = await verifyToken(token);
      ctx.user = decoded;
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    ctx.user = null;
    return next({
      ctx: {
        ...ctx,
        user: null,
      },
    });
  }
});

export const router = t.router;
export const publicProcedure = t.procedure.use(errorHandler).use(authMiddleware);
export const middleware = t.middleware;

// Input validation middleware
export const inputMiddleware = middleware(async ({ next, rawInput }) => {
  try {
    if (typeof rawInput === 'string') {
      try {
        const parsed = JSON.parse(rawInput);
        return next({
          rawInput: parsed
        });
      } catch (e) {
        console.error('Error parsing input:', e);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid input format',
          cause: e
        });
      }
    }
    return next();
  } catch (error) {
    console.error('Error in input middleware:', {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
});

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