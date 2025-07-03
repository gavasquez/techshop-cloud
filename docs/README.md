# TechShop Cloud - E-commerce Platform
# 🗂 Estructura Inicial del Proyecto – TechShop Cloud

Este repositorio contiene la estructura base del backend de **TechShop Cloud**, una plataforma de comercio electrónico construida con **Node.js**, **TypeScript**, **MongoDB** y **Mongoose**. El diseño sigue los principios de **Domain-Driven Design (DDD)** y **arquitectura hexagonal**, lo cual permite una solución altamente escalable, mantenible y orientada al dominio.

##  Estructura de Carpetas

techshop-cloud/
├── src/                       # Código fuente principal
│   ├── domain/               # Entidades, value objects y lógica de dominio
│   ├── application/          # Casos de uso y coordinación del dominio
│   ├── infrastructure/       # Adaptadores externos como la base de datos
│   ├── interfaces/           # Interfaces de entrada (HTTP, CLI, etc.)
│   ├── config/               # Configuraciones de entorno y conexiones
│   └── index.ts              # Punto de entrada principal de la aplicación
│
├── tests/                    # Pruebas unitarias y de integración (TDD)
│
├── .env                      # Variables de entorno (no versionadas)
├── tsconfig.json             # Configuración de TypeScript
├── jest.config.js            # Configuración de Jest para pruebas
├── Dockerfile                # Archivo Docker para empaquetar la app
├── docker-compose.yml        # Orquestación de servicios (ej. MongoDB)
└── README.md                 # Documentación general del proyecto

## Descripción del Proyecto

TechShop Cloud es una plataforma de comercio electrónico escalable diseñada para la venta de productos tecnológicos. El proyecto implementa una arquitectura robusta basada en Domain-Driven Design (DDD) y arquitectura hexagonal, proporcionando escalabilidad, seguridad y tolerancia a fallos.

##  Objetivos del Proyecto

- **Escalabilidad**: Arquitectura que soporta crecimiento horizontal y vertical
- **Seguridad**: Implementación de autenticación JWT, encriptación AES-256 y autorización basada en roles
- **Tolerancia a Fallos**: Patrones de resiliencia como Circuit Breaker y retry automático
- **Mantenibilidad**: Código limpio siguiendo principios SOLID y DDD
- **Calidad**: Desarrollo guiado por pruebas (TDD) con cobertura >80%

## Arquitectura General

### Capas de la Aplicación

```
┌─────────────────────────────────────┐
│           Interfaces Layer          │
│  (Controllers, DTOs, Validators)    │
├─────────────────────────────────────┤
│          Application Layer          │
│     (Use Cases, Services)           │
├─────────────────────────────────────┤
│            Domain Layer             │
│   (Entities, Value Objects)         │
├─────────────────────────────────────┤
│        Infrastructure Layer         │
│ (Repositories, External Services)   │
└─────────────────────────────────────┘
```

### Principios Arquitectónicos

- **Domain-Driven Design**: Modelo de dominio rico y expresivo
- **Arquitectura Hexagonal**: Separación clara entre lógica de negocio e infraestructura
- **CQRS**: Separación de comandos y consultas
- **Event Sourcing**: Para auditoría y trazabilidad

##  Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Lenguaje**: TypeScript 5.x
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Cache**: Redis
- **Testing**: Jest + Supertest

### Seguridad
- **Autenticación**: JWT (Access + Refresh Tokens)
- **Encriptación**: AES-256-GCM
- **Hashing**: bcrypt
- **Validación**: Custom validators

### DevOps
- **Contenedores**: Docker
- **Orquestación**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoreo**: Prometheus + Grafana

## Estado Actual del Desarrollo

### Completado (Sesión 5)
- [x] Estructura de proyecto con DDD
- [x] Product Entity con validaciones completas
- [x] User Entity con sistema de roles
- [x] Casos de uso para gestión de productos
- [x] Tests unitarios (56 tests pasando)
- [x] Configuración base de TypeScript y Jest

### En Desarrollo (Sesión 6)
- [x] Sistema JWT completo
- [x] Encriptación AES-256
- [x] Circuit Breaker para tolerancia a fallos
- [ ] Tests de seguridad y resiliencia
- [ ] Controladores REST
- [ ] Middleware de autenticación

### Próximas Fases
- [ ] API REST completa
- [ ] Integración con base de datos
- [ ] Sistema de notificaciones
- [ ] Configuración Docker/Kubernetes
- [ ] Monitoreo y métricas
- [ ] Documentación API (Swagger)

## Modelo de Dominio

### Entidades Principales

**Product**
- Gestión completa de productos
- Validaciones de negocio
- Control de inventario
- Categorización

**User** 
- Sistema de roles (ADMIN, USER, PROVIDER)
- Autenticación y autorización
- Perfil de usuario
- Seguridad (bloqueo de cuenta, intentos fallidos)

### Value Objects
- Email
- Money (precio con validaciones)
- ProductCategory
- UserRole

## Arquitectura de Seguridad

### Autenticación
- JWT con Access Tokens (1 hora) y Refresh Tokens (7 días)
- Rotación automática de tokens
- Invalidación de sesiones

### Autorización
- Control de acceso basado en roles (RBAC)
- Principio de menor privilegio
- Validación en múltiples capas

### Encriptación
- AES-256-GCM para datos sensibles
- bcrypt para contraseñas
- HTTPS en todas las comunicaciones

##  Tolerancia a Fallos

### Patrones Implementados
- **Circuit Breaker**: Protección contra fallos en servicios externos
- **Retry Pattern**: Reintentos con backoff exponencial
- **Timeout Pattern**: Timeouts configurables
- **Bulkhead Pattern**: Aislamiento de recursos

### Monitoreo
- Health checks automáticos
- Métricas de rendimiento
- Alertas proactivas
- Logging estructurado

##  Estrategia de Testing

### Cobertura Actual: 100% (56/56 tests)

- **Tests Unitarios**: Entidades y lógica de negocio
- **Tests de Integración**: Casos de uso y servicios
- **Tests E2E**: Flujos completos de usuario
- **Tests de Seguridad**: Validación de tokens y encriptación

### Metodología TDD
1. Red: Escribir test que falle
2. Green: Implementar funcionalidad mínima
3. Refactor: Mejorar código manteniendo tests

##  Despliegue y Escalabilidad

### Containerización
- Docker multi-stage builds
- Imágenes optimizadas
- Health checks integrados

### Kubernetes
- Deployments con rolling updates
- Horizontal Pod Autoscaler
- Service mesh para comunicación

### Escalabilidad
- Auto-scaling basado en métricas
- Load balancing inteligente
- Sharding de base de datos

##  Roadmap

### Fase 1: Core Platform (Actual)
- [x] Arquitectura base
- [x] Entidades principales
- [x] Sistema de seguridad
- [ ] API REST completa

### Fase 2: Advanced Features
- [ ] Sistema de carrito de compras
- [ ] Procesamiento de pagos
- [ ] Gestión de inventario en tiempo real
- [ ] Sistema de notificaciones

### Fase 3: Cloud Native
- [ ] Microservicios
- [ ] Event-driven architecture
- [ ] Observabilidad completa
- [ ] Multi-tenant support

##  Equipo y Contribución

### Roles del Proyecto
- **Arquitecto de Software**: Diseño y decisiones técnicas
- **Desarrollador Backend**: Implementación de lógica de negocio
- **DevOps Engineer**: Infraestructura y despliegue
- **QA Engineer**: Testing y calidad

### Estándares de Código
- TypeScript estricto
- ESLint + Prettier
- Conventional Commits
- Code reviews obligatorios

##  Documentación Adicional

- [Guía de Arquitectura](./docs/architecture/system-overview.md)
- [Diseño de Dominio](./docs/architecture/domain-design.md)
- [Especificación API](./docs/technical/api-specification.md)
- [Guía de Seguridad](./docs/technical/security-design.md)
- [Manual de Despliegue](./docs/technical/deployment-guide.md)
- [Guía de Desarrollo](./docs/development/setup-guide.md)

##  Contacto

Para preguntas técnicas o contribuciones, contactar al equipo de desarrollo.

---

**TechShop Cloud** - Construyendo el futuro del e-commerce con arquitectura de clase empresarial.