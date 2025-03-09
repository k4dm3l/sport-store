import winston from 'winston';
import env from '@root/configs';

const logger = winston.createLogger({
  level: env.ENVIRONMENT !== 'production' ? 'debug' : 'info',
  format: winston.format.combine(winston.format.cli()),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/system.log',
      format: winston.format.combine(winston.format.cli()),
    }),
  ],
});

if (env.ENVIRONMENT !== 'production' || env.LOG_IN_CONSOLE === true) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

export default logger;