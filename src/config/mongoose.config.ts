import mongoose from 'mongoose';

// ========================================
// TechShop Cloud - Mongoose Configuration
// Configuración optimizada para Docker y producción
// ========================================

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techshop';
  
  // Configuración base - SIMPLIFICADA
  const baseOptions: mongoose.ConnectOptions = {
    // Configuración básica
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
  };

  // Configuraciones específicas por entorno
  if (process.env.NODE_ENV === 'development') {
    return {
      uri,
      options: {
        ...baseOptions,
      }
    };
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      uri,
      options: {
        ...baseOptions,
        // Configuraciones de seguridad adicionales
        ssl: true,
        // Configuraciones de performance
        maxPoolSize: 20,
        minPoolSize: 5,
        // Configuraciones de timeout más estrictas
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 30000,
      }
    };
  }

  // Configuración por defecto
  return {
    uri,
    options: baseOptions
  };
};

export const connectDatabase = async (): Promise<void> => {
  const config = getDatabaseConfig();
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    console.log(`📍 URI: ${config.uri.replace(/\/\/.*@/, '//***:***@')}`); // Ocultar credenciales en logs
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    
    await mongoose.connect(config.uri, config.options);
    
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📊 Pool de conexiones: ${config.options.minPoolSize}-${config.options.maxPoolSize} conexiones`);
    
    // Configurar eventos de conexión
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose conectado');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Error en conexión Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose desconectado');
    });

    // Manejar cierre graceful
    process.on('SIGINT', async () => {
      console.log('🛑 Cerrando conexión a MongoDB...');
      await mongoose.connection.close();
      console.log('✅ Conexión cerrada');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🛑 Cerrando conexión a MongoDB...');
      await mongoose.connection.close();
      console.log('✅ Conexión cerrada');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    
    // En producción, reintentar conexión
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Reintentando conexión en 5 segundos...');
      setTimeout(() => {
        connectDatabase();
      }, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Función para verificar el estado de la conexión
export const getDatabaseStatus = (): {
  connected: boolean;
  readyState: number;
  host: string;
  name: string;
} => {
  const connection = mongoose.connection;
  return {
    connected: connection.readyState === 1,
    readyState: connection.readyState,
    host: connection.host || 'unknown',
    name: connection.name || 'unknown'
  };
};

// Función para cerrar la conexión
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error);
  }
};

// Función para health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    // Verificar si la conexión está activa
    if (mongoose.connection.readyState !== 1) {
      return false;
    }
    
    // Ejecutar ping para verificar conectividad
    const db = mongoose.connection.db;
    if (db) {
      await db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
