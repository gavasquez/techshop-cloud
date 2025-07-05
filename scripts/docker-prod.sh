#!/bin/bash

# ========================================
# TechShop Cloud - Docker Production Script
# Script para ejecutar el entorno de producción
# ========================================

set -e

echo "🐳 Iniciando TechShop Cloud en modo producción..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Verificar que docker-compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose no está instalado"
    exit 1
fi

# Verificar variables de entorno críticas
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI no está definida"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET no está definida"
    exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "❌ Error: JWT_REFRESH_SECRET no está definida"
    exit 1
fi

# Crear certificados SSL si no existen
if [ ! -f "docker/nginx/ssl/cert.pem" ] || [ ! -f "docker/nginx/ssl/key.pem" ]; then
    echo "🔐 Generando certificados SSL autofirmados..."
    mkdir -p docker/nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout docker/nginx/ssl/key.pem \
        -out docker/nginx/ssl/cert.pem \
        -subj "/C=CO/ST=Colombia/L=Bogota/O=TechShop/CN=localhost"
fi

# Construir imagen de producción
echo "🔨 Construyendo imagen de producción..."
docker-compose -f docker-compose.prod.yml build

# Levantar servicios de producción
echo "🚀 Levantando servicios de producción..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ TechShop Cloud está corriendo en producción!"
echo ""
echo "📊 Servicios disponibles:"
echo "   🌐 API: https://localhost"
echo "   📚 Swagger: https://localhost/api-docs"
echo "   🗄️  MongoDB: localhost:27017"
echo "   🔴 Redis: localhost:6379"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Parar servicios: docker-compose -f docker-compose.prod.yml down"
echo "   Escalar API: docker-compose -f docker-compose.prod.yml up -d --scale api=3"
echo "   Backup DB: docker exec techshop-mongodb-prod mongodump --out /backup"
echo ""
echo "⚠️  Recuerda configurar un dominio real y certificados SSL válidos para producción"
echo "" 