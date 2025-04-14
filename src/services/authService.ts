import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

class AuthService {
  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
