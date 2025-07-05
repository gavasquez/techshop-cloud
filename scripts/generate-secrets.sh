#!/bin/bash

# ========================================
# TechShop Cloud - Generate Secrets Script
# Script para generar claves secretas seguras
# ========================================

echo "🔐 Generando claves secretas para TechShop Cloud..."
echo ""

# Verificar si openssl está disponible
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl no está instalado"
    exit 1
fi

echo "📝 Generando claves secretas..."
echo ""

# Generar JWT Secret
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT_SECRET"

# Generar JWT Refresh Secret
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"

# Generar AES Secret Key
AES_SECRET_KEY=$(openssl rand -hex 32)
echo "AES_SECRET_KEY=$AES_SECRET_KEY"

echo ""
echo "✅ Claves secretas generadas exitosamente"
echo ""
echo "📋 Copia estas líneas a tu archivo .env:"
echo "=========================================="
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "AES_SECRET_KEY=$AES_SECRET_KEY"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Guarda estas claves en un lugar seguro"
echo "   - Nunca las compartas o subas a Git"
echo "   - Usa claves diferentes para cada entorno"
echo "   - Regenera las claves si se comprometen"
echo "" 