import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Map 2.0 API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Map 2.0 application',
      contact: {
        name: 'API Support',
        email: 'support@map2.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Place: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            latitude: { type: 'number', format: 'float' },
            longitude: { type: 'number', format: 'float' },
            address: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            category: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            website: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Taxi: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            phone: { type: 'string' },
            available: { type: 'boolean' },
            carModel: { type: 'string' },
            licensePlate: { type: 'string' },
            driverName: { type: 'string' },
            rating: { type: 'number', format: 'float' },
            currentLocation: {
              type: 'object',
              properties: {
                latitude: { type: 'number', format: 'float' },
                longitude: { type: 'number', format: 'float' }
              }
            },
            features: { type: 'array', items: { type: 'string' } }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            placeId: { type: 'integer' },
            userId: { type: 'integer' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            content: { type: 'string' },
            title: { type: 'string' },
            visitDate: { type: 'string', format: 'date' },
            photos: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                httpStatus: { type: 'integer' },
                path: { type: 'string' },
                stack: { type: 'string', nullable: true }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}; 