# TechShop Cloud API Documentation

## 📚 Documentación de la API

La API de TechShop Cloud está completamente documentada usando **Swagger/OpenAPI 3.0**. Puedes acceder a la documentación interactiva en:

**🔗 URL de la documentación:** `http://localhost:3005/api-docs`

## 🚀 Características de la Documentación

### ✨ Documentación Completa
- **Todos los endpoints** documentados con ejemplos
- **Esquemas de datos** detallados para cada entidad
- **Códigos de respuesta** HTTP con descripciones
- **Ejemplos de request/response** en JSON
- **Autenticación JWT** configurada

### 📋 Endpoints Documentados

#### 🔐 Autenticación (Rutas Públicas)
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token de acceso

#### 👥 Usuarios (Rutas Protegidas)
- `GET /api/users/profile/{id}` - Obtener perfil de usuario

#### 📦 Productos
- `POST /api/products` - Crear producto
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/search` - Buscar productos con filtros

#### 🛒 Carrito
- `POST /api/cart` - Agregar producto al carrito
- `GET /api/cart/{userId}` - Obtener items del carrito
- `DELETE /api/cart/{id}` - Eliminar item del carrito
- `DELETE /api/cart/{userId}/clear` - Vaciar carrito

#### 📋 Órdenes
- `POST /api/orders` - Crear orden desde carrito
- `GET /api/orders/{id}` - Obtener orden por ID
- `GET /api/orders/customer/{customerId}` - Órdenes de un cliente
- `PUT /api/orders/{id}/status` - Actualizar estado de orden
- `DELETE /api/orders/{id}` - Cancelar orden

#### 💳 Pagos
- `POST /api/orders/payments/{paymentId}/process` - Procesar pago

## 🛠️ Cómo Usar la Documentación

### 1. Acceder a Swagger UI
```bash
# Inicia el servidor
npm run dev

# Abre en tu navegador
http://localhost:3005/api-docs
```

### 2. Autenticación
1. **Registra un usuario** usando `POST /api/auth/register`
2. **Opcional**: Inicia sesión con `POST /api/auth/login` (si no usaste los tokens del registro)
3. **Copia el accessToken** de la respuesta
4. **Haz clic en "Authorize"** en Swagger UI
5. **Ingresa**: `Bearer <tu-access-token>`
6. **Para renovar token**: Usa `POST /api/auth/refresh` cuando expire

### 3. Probar Endpoints
- Cada endpoint tiene un botón "Try it out"
- Puedes modificar los parámetros y datos de ejemplo
- Haz clic en "Execute" para probar la API
- Ve la respuesta en tiempo real

## 📊 Esquemas de Datos

### Usuario (User)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "usuario@ejemplo.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "fullName": "Juan Pérez",
  "roles": ["USER"],
  "active": true,
  "emailVerified": true,
  "lastLoginAt": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "isNewUser": true,
  "daysSinceCreation": 0
}
```

### Producto (Product)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "iPhone 15 Pro",
  "description": "El último iPhone con tecnología avanzada",
  "price": 1299.99,
  "category": "Electrónicos",
  "stockQuantity": 50,
  "active": true,
  "hasStock": true,
  "isLowStock": false,
  "isExpensive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Orden (Order)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "customerId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 2,
      "price": 1299.99,
      "total": 2599.98
    }
  ],
  "status": "PENDING",
  "total": 3899.97,
  "shippingAddress": {
    "street": "Calle 123 #45-67",
    "city": "Bogotá",
    "state": "Cundinamarca",
    "zipCode": "110111",
    "country": "Colombia"
  },
  "paymentMethod": "CREDIT_CARD",
  "trackingNumber": "TRK123456789",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Flujo de Uso Típico

### 1. Registro y Login
```bash
# 1. Registrar usuario
POST /api/auth/register
{
  "email": "usuario@ejemplo.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "password": "Contraseña123!"
}

# Respuesta del registro:
{
  "success": true,
  "message": "Usuario registrado exitosamente. Ya puedes hacer login.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "emailVerified": true,
      "roles": ["USER"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600000
    }
  }
}

# 2. Login (opcional, ya tienes tokens del registro)
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!"
}

# 3. Renovar token (cuando expire)
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Explorar Productos
```bash
# Obtener todos los productos
GET /api/products

# Buscar productos con filtros
GET /api/products/search?category=Electrónicos&minPrice=100&maxPrice=2000&inStock=true
```

### 3. Gestionar Carrito
```bash
# Agregar producto al carrito
POST /api/cart
{
  "userId": "507f1f77bcf86cd799439012",
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 2
}

# Ver carrito
GET /api/cart/507f1f77bcf86cd799439012
```

### 4. Ver Perfil de Usuario
```bash
# Ver perfil (requiere autenticación)
GET /api/users/profile/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Crear Orden
```bash
# Crear orden desde carrito (requiere autenticación)
POST /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "customerId": "507f1f77bcf86cd799439012",
  "shippingAddress": {
    "street": "Calle 123 #45-67",
    "city": "Bogotá",
    "state": "Cundinamarca",
    "zipCode": "110111",
    "country": "Colombia"
  },
  "paymentMethod": "CREDIT_CARD"
}
```

### 6. Gestionar Orden
```bash
# Ver orden (requiere autenticación)
GET /api/orders/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Actualizar estado (requiere autenticación)
PUT /api/orders/507f1f77bcf86cd799439011/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "status": "CONFIRMED",
  "note": "Orden confirmada y lista para envío"
}

# Procesar pago (requiere autenticación)
POST /api/orders/payments/507f1f77bcf86cd799439011/process
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | ✅ Éxito - Operación completada |
| 201 | ✅ Creado - Recurso creado exitosamente |
| 400 | ❌ Bad Request - Datos de entrada inválidos |
| 401 | ❌ Unauthorized - No autenticado |
| 404 | ❌ Not Found - Recurso no encontrado |
| 409 | ❌ Conflict - Conflicto (ej: email duplicado) |
| 423 | ❌ Locked - Cuenta bloqueada |
| 500 | ❌ Internal Server Error - Error del servidor |

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```env
PORT=3005
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu-secreto-jwt
```

### Scripts Disponibles
```bash
# Desarrollo
npm run dev

# Producción
npm start

# Tests
npm test

# Build
npm run build
```

## 📝 Notas Importantes

1. **Autenticación**: 
   - Rutas públicas: `/api/auth/*` (registro, login, refresh)
   - Rutas protegidas: Todas las demás requieren `Authorization: Bearer <token>`
2. **Tokens JWT**: 
   - `accessToken`: Expira en 1 hora
   - `refreshToken`: Expira en 7 días
3. **Verificación de email**: Automática (`emailVerified: true`)
4. **IDs**: Todos los IDs son MongoDB ObjectIds convertidos a string
5. **Fechas**: Todas las fechas están en formato ISO 8601
6. **Precios**: Los precios están en formato decimal (ej: 1299.99)
7. **Paginación**: Los endpoints de listado no incluyen paginación por simplicidad

## 🆘 Soporte

Si tienes problemas con la API:

1. Revisa la documentación Swagger en `/api-docs`
2. Verifica los logs del servidor
3. Asegúrate de que MongoDB esté conectado
4. Confirma que las variables de entorno estén configuradas

---

**TechShop Cloud API** - Documentación completa y profesional para tu e-commerce 🚀 