#!/bin/bash

# ========================================
# TechShop Cloud - Docker Development Script
# Script para ejecutar el entorno de desarrollo
# ========================================

set -e

echo "🐳 Iniciando TechShop Cloud en modo desarrollo..."

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

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Por favor, edita el archivo .env con tus configuraciones"
fi

# Construir y levantar servicios
echo "🔨 Construyendo servicios..."
docker-compose build

echo "🚀 Levantando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

echo ""
echo "✅ TechShop Cloud está corriendo!"
echo ""
echo "📊 Servicios disponibles:"
echo "   🌐 API: http://localhost:3000"
echo "   📚 Swagger: http://localhost:3000/api-docs"
echo "   🗄️  MongoDB: localhost:27017"
echo "   🔴 Redis: localhost:6379"
echo "   📊 Mongo Express: http://localhost:8081"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar servicios: docker-compose down"
echo "   Reconstruir: docker-compose build --no-cache"
echo "   Limpiar: docker-compose down -v"
echo "" 