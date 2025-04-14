import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/map_db',
  pool: {
    min: 2,
    max: 10,
  },
};
