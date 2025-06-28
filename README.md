# 🗂 Estructura Inicial del Proyecto – TechShop Cloud

Este repositorio contiene la estructura base del backend de **TechShop Cloud**, una plataforma de comercio electrónico construida con **Node.js**, **TypeScript**, **MongoDB** y **Mongoose**. El diseño sigue los principios de **Domain-Driven Design (DDD)** y **arquitectura hexagonal**, lo cual permite una solución altamente escalable, mantenible y orientada al dominio.

## 📁 Estructura de Carpetas

```bash
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
