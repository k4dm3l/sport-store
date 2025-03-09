import swaggerJSDoc from 'swagger-jsdoc';
import env from '@root/configs';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sports API',
      version: '1.0.0',
      description: 'API para gestión de productos deportivos'
    },
    servers: [{ url: `http://localhost:${env.PORT}/api/${env.API_VERSION}` }],
    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    './src/docs/swagger/*.yml',
    './src/schemas/*.ts',
  ]
};

export const swaggerSpec = swaggerJSDoc(options);