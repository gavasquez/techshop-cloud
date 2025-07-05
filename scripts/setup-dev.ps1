# ========================================
# TechShop Cloud - Setup Development Script
# Script para configurar el entorno de desarrollo
# ========================================

Write-Host "🚀 Configurando TechShop Cloud para desarrollo..." -ForegroundColor Green
Write-Host ""

# Verificar si Node.js está instalado
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar si npm está instalado
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: npm no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🔐 Generando claves secretas..." -ForegroundColor Yellow

# Función para generar bytes aleatorios y convertirlos a hex
function Generate-RandomHex {
    param([int]$Length = 32)
    $bytes = New-Object byte[] $Length
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

# Generar claves secretas
$JWT_SECRET = Generate-RandomHex 32
$JWT_REFRESH_SECRET = Generate-RandomHex 32
$AES_SECRET_KEY = Generate-RandomHex 32

Write-Host "✅ Claves secretas generadas" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Configurando archivo .env..." -ForegroundColor Yellow

# Crear archivo .env si no existe
if (!(Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Host "✅ Archivo .env creado desde env.example" -ForegroundColor Green
}

# Leer el archivo .env
$envContent = Get-Content ".env" -Raw

# Reemplazar las claves secretas
$envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$JWT_SECRET"
$envContent = $envContent -replace "JWT_REFRESH_SECRET=.*", "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
$envContent = $envContent -replace "AES_SECRET_KEY=.*", "AES_SECRET_KEY=$AES_SECRET_KEY"

# Guardar el archivo .env actualizado
$envContent | Set-Content ".env"

Write-Host "✅ Archivo .env configurado con las claves secretas" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Verificando configuración..." -ForegroundColor Yellow

# Verificar que el archivo .env existe y tiene contenido
if (Test-Path ".env") {
    $envLines = Get-Content ".env"
    $hasJwtSecret = $envLines | Where-Object { $_ -match "JWT_SECRET=" }
    $hasMongoUri = $envLines | Where-Object { $_ -match "MONGODB_URI=" }
    
    if ($hasJwtSecret -and $hasMongoUri) {
        Write-Host "✅ Configuración verificada correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Algunas variables de entorno pueden estar faltando" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Error: No se pudo crear el archivo .env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecutar: npm run dev" -ForegroundColor White
Write-Host "   2. Abrir: http://localhost:3000/api-docs" -ForegroundColor White
Write-Host "   3. Probar: http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   - npm run dev          # Desarrollo con hot reload" -ForegroundColor White
Write-Host "   - npm run build        # Build de producción" -ForegroundColor White
Write-Host "   - npm test             # Ejecutar tests" -ForegroundColor White
Write-Host "   - npm run test:watch   # Tests en modo watch" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Cyan
Write-Host "   - API Docs: http://localhost:3000/api-docs" -ForegroundColor White
Write-Host "   - Docker Guide: docs/docker-guide.md" -ForegroundColor White
Write-Host "" 