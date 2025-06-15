import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { UserRole } from '../middleware/authMiddleware';
import prisma from '../prisma';
import type { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

const prismaClient = prisma as unknown as PrismaClient & {
  user: {
    create: (args: unknown) => Promise<unknown>;
    findUnique: (args: unknown) => Promise<unknown>;
  };
};

export class UserService {
  async register(email: string, password: string, role: UserRole = UserRole.USER) {
    // Input validation
    if (!email || !password) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Email and password are required',
      });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid email format',
      });
    }

    if (password.length < 8) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User already exists',
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prismaClient.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      const { token, refreshToken } = this.generateTokens(user);
      return { user, token, refreshToken };
    } catch (error) {
      console.error('Registration error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Email and password are required',
      });
    }

    try {
      const user = await prismaClient.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid email or password',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Login error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to login',
      });
    }
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Refresh token is required',
      });
    }

    try {
      const payload = verifyToken(refreshToken);
      const user = await prismaClient.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
      };

      const token = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }
  }

  async validateToken(token: string) {
    try {
      const payload = verifyToken(token);
      const user = await prismaClient.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return { isValid: true, user };
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      });
    }
  }

  private generateTokens(user: { id: number; email: string; role: "ADMIN" | "USER" }) {
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { token, refreshToken };
  }
}
