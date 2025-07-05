import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { connectDatabase, healthCheck } from './config/mongoose.config';
import routes from './interfaces/http/routes';

const app = express();

// ========================================
// Middleware de seguridad y configuración
// ========================================

// Helmet para headers de seguridad
app.use(helmet());

// CORS configurado
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3006',
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));

// Morgan para logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// Ruta de inicio
// ========================================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TechShop Cloud API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      docs: '/api-docs',
      health: '/health',
      api: '/api'
    },
    timestamp: new Date().toISOString()
  });
});

// ========================================
// Health Check Endpoint
// ========================================
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    const status = dbHealth ? 'healthy' : 'unhealthy';
    const statusCode = dbHealth ? 200 : 503;
    
    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// ========================================
// Swagger Documentation
// ========================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TechShop Cloud API',
      version: '1.0.0',
      description: 'API de comercio electrónico con arquitectura DDD',
      contact: {
        name: 'TechShop Team',
        email: 'support@techshop.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.techshop.com' 
          : 'http://localhost:3006',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/interfaces/http/controllers/**/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TechShop Cloud API Documentation',
  swaggerOptions: {
    url: '/api-docs/swagger.json'
  }
}));

// Endpoint para el JSON de Swagger
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ========================================
// API Routes
// ========================================
app.use('/api', routes);

// ========================================
// Error Handling
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.path
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ========================================
// Inicialización
// ========================================
const PORT = process.env.PORT || 3006;

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
