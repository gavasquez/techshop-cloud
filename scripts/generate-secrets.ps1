# ========================================
# TechShop Cloud - Generate Secrets Script (PowerShell)
# Script para generar claves secretas seguras en Windows
# ========================================

Write-Host "🔐 Generando claves secretas para TechShop Cloud..." -ForegroundColor Green
Write-Host ""

# Función para generar bytes aleatorios y convertirlos a hex
function Generate-RandomHex {
    param([int]$Length = 32)
    $bytes = New-Object byte[] $Length
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

Write-Host "📝 Generando claves secretas..." -ForegroundColor Yellow
Write-Host ""

# Generar JWT Secret
$JWT_SECRET = Generate-RandomHex 32
Write-Host "JWT_SECRET=$JWT_SECRET"

# Generar JWT Refresh Secret
$JWT_REFRESH_SECRET = Generate-RandomHex 32
Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"

# Generar AES Secret Key
$AES_SECRET_KEY = Generate-RandomHex 32
Write-Host "AES_SECRET_KEY=$AES_SECRET_KEY"

Write-Host ""
Write-Host "✅ Claves secretas generadas exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Copia estas líneas a tu archivo .env:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray
Write-Host "JWT_SECRET=$JWT_SECRET" -ForegroundColor White
Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" -ForegroundColor White
Write-Host "AES_SECRET_KEY=$AES_SECRET_KEY" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "   - Guarda estas claves en un lugar seguro" -ForegroundColor Yellow
Write-Host "   - Nunca las compartas o subas a Git" -ForegroundColor Yellow
Write-Host "   - Usa claves diferentes para cada entorno" -ForegroundColor Yellow
Write-Host "   - Regenera las claves si se comprometen" -ForegroundColor Yellow
Write-Host "" 