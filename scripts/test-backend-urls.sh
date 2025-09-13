#!/bin/bash

# Script para probar las URLs del backend
set -e

echo "🧪 Probando URLs del backend..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# URL base del backend
BASE_URL="https://tienda-diego-qkm5.onrender.com"

# Función para probar una URL
test_url() {
    local url="$1"
    local description="$2"
    
    info "Probando: $description"
    info "URL: $url"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/url_response.json "$url")
    
    if [ "$response" = "200" ]; then
        log "✅ $description - Status: $response"
        echo "Respuesta:"
        head -c 200 /tmp/url_response.json
        echo ""
    else
        warn "⚠️ $description - Status: $response"
        if [ -f /tmp/url_response.json ]; then
            echo "Error:"
            cat /tmp/url_response.json
            echo ""
        fi
    fi
    echo ""
}

# Probar URLs principales
log "Iniciando pruebas de URLs del backend..."

test_url "$BASE_URL" "Health check (raíz)"
test_url "$BASE_URL/api/health" "Health check API"
test_url "$BASE_URL/api/categories" "Categorías"
test_url "$BASE_URL/api/banners/active" "Banners activos"
test_url "$BASE_URL/api/products/featured?limit=8" "Productos destacados"
test_url "$BASE_URL/api/products?page=1&limit=10" "Productos"

# Probar con headers de CORS
log "Probando con headers de CORS..."

info "Probando CORS con Origin: https://tiendadiego.vercel.app"
response=$(curl -s -w "%{http_code}" -o /tmp/cors_response.json \
  -H "Origin: https://tiendadiego.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  "$BASE_URL/api/categories")

if [ "$response" = "200" ]; then
    log "✅ CORS preflight exitoso"
else
    warn "⚠️ CORS preflight falló - Status: $response"
    if [ -f /tmp/cors_response.json ]; then
        echo "Error CORS:"
        cat /tmp/cors_response.json
        echo ""
    fi
fi

# Limpiar archivos temporales
rm -f /tmp/url_response.json /tmp/cors_response.json

log "✅ Pruebas de URLs completadas"
