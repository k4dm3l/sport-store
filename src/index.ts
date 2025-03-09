import express, { Application } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { requestLimiter } from './middlewares/rate-limiter';
import logger from '@root/libs/logger';
import { server } from '@root/server';
import { utilsFactory } from '@root/libs/utils';

const app: Application = express();

app.use(cors({
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  credentials: true,
  methods: ['POST', 'PUT', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
  origin: '*',
  preflightContinue: false,
}));
app.use(compression());
app.use(helmet());
app.use(express.json({ limit: '50 mb' }));
app.use(express.urlencoded({ extended: true, limit: '50 mb', parameterLimit: 50000 }));
app.use(requestLimiter);

server({
  app,
  logger,
  utils: utilsFactory(),
});