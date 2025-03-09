import { Router } from 'express';
import swaggerUI from 'swagger-ui-express';
import { swaggerSpec } from './swagger-config';

export const swaggerRouter = Router()
  .use('/api-docs', swaggerUI.serve)
  .get('/api-docs', swaggerUI.setup(swaggerSpec));