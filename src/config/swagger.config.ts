import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TechShop Cloud API',
      version: '1.0.0',
      description: 'API completa para e-commerce TechShop Cloud con gestión de productos, usuarios, carrito, órdenes, pagos y notificaciones',
      contact: {
        name: 'TechShop Cloud Team',
        email: 'support@techshop-cloud.com',
        url: 'https://techshop-cloud.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3005/api',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.techshop-cloud.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint de login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error description'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/interfaces/http/controllers/**/*.ts',
    './src/interfaces/http/routes/**/*.ts'
  ]
};

export const specs = swaggerJsdoc(options); 