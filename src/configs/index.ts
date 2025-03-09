import { config } from 'dotenv';
config();

export default {
  PORT: process.env.PORT || 3002,
  MAX_REQUEST_RATE_LIMIT: process.env.MAX_REQUEST_RATE_LIMIT || 4,
  MAX_TIMEOUT_RATE_LIMIT: process.env.MAX_TIMEOUT_RATE_LIMIT || 5000,
  ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  LOG_IN_CONSOLE: Boolean(process.env.LOG_IN_CONSOLE || false),
  MONGO_DB_URI: process.env.MONGO_DB_URI || '',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || '',
  REDIS_URI: process.env.REDIS_URI || '',
  REDIS_TTL: Number(process.env.REDIS_TTL) || 600,
  JWT_SECRET: process.env.JWT_SECRET || '',
  API_VERSION: process.env.API_VERSION || '',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '',
};