import { appConfig } from './app.config';
import { dbConfig } from './db.config';
import { jwtConfig } from './jwt.config';
import { corsConfig } from './cors.config';
import { rateLimitConfig } from './rate-limit.config';

export const config = {
  app: appConfig,
  db: dbConfig,
  jwt: jwtConfig,
  cors: corsConfig,
  rateLimit: rateLimitConfig,
};

export type Config = typeof config; 