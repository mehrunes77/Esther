import winston from 'winston';
import path from 'path';

const logsDir = path.join(process.env.HOME || '/tmp', '.esther/logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'esther' },
  transports: [
    // Only log to file in production
    process.env.NODE_ENV === 'production'
      ? new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' })
      : new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
  ],
});

export default logger;
