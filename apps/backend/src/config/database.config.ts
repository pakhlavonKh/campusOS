import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  name: process.env.DATABASE_NAME || 'campusos',
  username: process.env.DATABASE_USER || 'campusos',
  password: process.env.DATABASE_PASSWORD || 'campusos_dev_password',
  ssl: process.env.DATABASE_SSL === 'true',
}));
