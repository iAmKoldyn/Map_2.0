import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

export class UserService {
  async register(email: string, password: string, role: Role = Role.USER) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return { user, token, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return { user, token, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: number; role: Role };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      
      if (!user) {
        throw new Error('User not found');
      }

      const token = generateToken({ userId: user.id, role: user.role });
      return { token };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}