import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { UserService } from '../services/userService';
import { UserRole } from '../middleware/authMiddleware';

const userService = new UserService();

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      role: z.nativeEnum(UserRole).optional()
    }))
    .mutation(async ({ input }) => {
      const { email, password, role } = input;
      return userService.register(email, password, role);
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input }) => {
      const { email, password } = input;
      return userService.login(email, password);
    }),

  refreshToken: publicProcedure
    .input(z.object({
      refreshToken: z.string()
    }))
    .mutation(async ({ input }) => {
      return userService.refreshToken(input.refreshToken);
    })
}); 