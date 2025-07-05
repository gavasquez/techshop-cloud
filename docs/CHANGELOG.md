# Changelog - TechShop Cloud

## [1.2.0] - 2024-01-XX

### 🔐 Autenticación y Autorización
- **Nuevo**: Sistema JWT completo con Access y Refresh Tokens
- **Nuevo**: Endpoints separados para Auth (`/api/auth/*`) y User (`/api/users/*`)
- **Nuevo**: Middleware de autenticación JWT para rutas protegidas
- **Mejorado**: Verificación automática de email (`emailVerified: true`)
- **Mejorado**: Respuesta de registro incluye tokens automáticamente

### 📚 Documentación
- **Actualizado**: Documentación Swagger completa con autenticación
- **Actualizado**: Esquemas de respuesta para incluir tokens JWT
- **Actualizado**: Ejemplos de uso con headers de autorización
- **Nuevo**: Documentación de endpoints de renovación de tokens
- **Mejorado**: Instrucciones de autenticación en Swagger UI

### 🔄 Endpoints Actualizados

#### Autenticación (Rutas Públicas)
- `POST /api/auth/register` - Registro con tokens automáticos
- `POST /api/auth/login` - Login con tokens JWT
- `POST /api/auth/refresh` - Renovación de tokens

#### Usuarios (Rutas Protegidas)
- `GET /api/users/profile/{id}` - Ver perfil de usuario

#### Órdenes (Rutas Protegidas)
- `POST /api/orders` - Crear orden
- `GET /api/orders/{id}` - Ver orden
- `PUT /api/orders/{id}/status` - Actualizar estado
- `POST /api/orders/payments/{id}/process` - Procesar pago

#### Carrito (Rutas Protegidas)
- `POST /api/cart` - Agregar al carrito
- `GET /api/cart/{userId}` - Ver carrito
- `DELETE /api/cart/{id}` - Remover del carrito
- `DELETE /api/cart/{userId}/clear` - Limpiar carrito

#### Productos
- `GET /api/products` - Listar productos (público)
- `POST /api/products` - Crear producto (protegido)

### 🛡️ Seguridad
- **Nuevo**: Tokens JWT con expiración configurable
  - Access Token: 1 hora
  - Refresh Token: 7 días
- **Mejorado**: Validación de contraseñas (mínimo 8 caracteres)
- **Mejorado**: Manejo de errores de autenticación

### 📖 Guías de Uso
- **Actualizado**: Instrucciones paso a paso para autenticación
- **Nuevo**: Ejemplos de flujo completo de registro y login
- **Mejorado**: Documentación de códigos de respuesta HTTP

## [1.1.0] - 2024-01-XX

### 🛒 E-commerce Completo
- **Nuevo**: Sistema de carrito de compras
- **Nuevo**: Sistema de órdenes y pagos
- **Nuevo**: Sistema de notificaciones
- **Nuevo**: Integración con MongoDB Atlas

### 📊 Base de Datos
- **Cambio**: Migración de UUID a MongoDB ObjectId
- **Mejorado**: Eliminación de índices únicos problemáticos
- **Optimizado**: Consultas nativas de MongoDB

## [1.0.0] - 2024-01-XX

### 🏗️ Arquitectura Base
- **Nuevo**: Estructura DDD completa
- **Nuevo**: Entidades Product y User
- **Nuevo**: Casos de uso básicos
- **Nuevo**: Tests unitarios (56 tests)
- **Nuevo**: Configuración TypeScript y Jest

---

## Notas de Migración

### Para Desarrolladores
1. **Autenticación**: Todos los endpoints protegidos requieren `Authorization: Bearer <token>`
2. **Tokens**: Usar `accessToken` para requests, `refreshToken` para renovar
3. **Verificación**: Los usuarios se crean con `emailVerified: true` automáticamente

### Para Testing
1. Registrar usuario con `POST /api/auth/register`
2. Copiar `accessToken` de la respuesta
3. Usar en header: `Authorization: Bearer <accessToken>`
4. Renovar con `POST /api/auth/refresh` cuando expire 