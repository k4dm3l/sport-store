import rateLimiter from 'express-rate-limit';
import env from '@root/configs';
import { utilsFactory } from '@root/libs/utils';

const utils = utilsFactory();

export const requestLimiter = rateLimiter({
  max: utils.normalizeNumber(env.MAX_REQUEST_RATE_LIMIT),
  windowMs: utils.normalizeNumber(env.MAX_TIMEOUT_RATE_LIMIT),
  message: 'middlewares: request limit reached',
});