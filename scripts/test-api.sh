#!/bin/bash

# Script para probar las APIs del backend
set -e

echo "🧪 Probando APIs del backend..."

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

# Verificar que el backend esté corriendo
log "Verificando que el backend esté corriendo..."
if ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    error "Backend no está corriendo en http://localhost:5000. Inicia el backend primero."
fi

# URLs base
BASE_URL="http://localhost:5000/api"

# Función para probar una API
test_api() {
    local endpoint="$1"
    local expected_status="$2"
    local description="$3"
    
    info "Probando: $description"
    info "Endpoint: $BASE_URL$endpoint"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/api_response.json "$BASE_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        log "✅ $description - Status: $response"
        
        # Mostrar parte de la respuesta si es exitosa
        if [ "$response" = "200" ]; then
            echo "Respuesta:"
            head -c 200 /tmp/api_response.json
            echo ""
        fi
    else
        error "❌ $description - Status esperado: $expected_status, obtenido: $response"
    fi
    echo ""
}

# Probar APIs principales
log "Iniciando pruebas de API..."

test_api "/categories" "200" "Obtener categorías"
test_api "/banners/active" "200" "Obtener banners activos"
test_api "/products/featured?limit=8" "200" "Obtener productos destacados"
test_api "/products?page=1&limit=10" "200" "Obtener productos"
test_api "/health" "200" "Health check"

# Probar con datos de ejemplo
log "Probando con datos específicos..."

# Verificar que hay categorías
categories_count=$(curl -s "$BASE_URL/categories" | jq '.categories | length' 2>/dev/null || echo "0")
if [ "$categories_count" -gt 0 ]; then
    log "✅ Se encontraron $categories_count categorías"
else
    warn "⚠️ No se encontraron categorías. Ejecuta el seed: npm run seed"
fi

# Verificar que hay banners activos
banners_count=$(curl -s "$BASE_URL/banners/active" | jq '.data | length' 2>/dev/null || echo "0")
if [ "$banners_count" -gt 0 ]; then
    log "✅ Se encontraron $banners_count banners activos"
else
    warn "⚠️ No se encontraron banners activos. Ejecuta el seed: npm run seed"
fi

# Verificar que hay productos destacados
featured_count=$(curl -s "$BASE_URL/products/featured?limit=8" | jq '. | length' 2>/dev/null || echo "0")
if [ "$featured_count" -gt 0 ]; then
    log "✅ Se encontraron $featured_count productos destacados"
else
    warn "⚠️ No se encontraron productos destacados. Ejecuta el seed: npm run seed"
fi

# Limpiar archivos temporales
rm -f /tmp/api_response.json

log "✅ Pruebas de API completadas exitosamente!"
info "📋 Resumen:"
info "  - Categorías: $categories_count"
info "  - Banners activos: $banners_count"
info "  - Productos destacados: $featured_count"

if [ "$categories_count" -eq 0 ] || [ "$banners_count" -eq 0 ] || [ "$featured_count" -eq 0 ]; then
    warn "⚠️ Algunos datos están faltando. Ejecuta: npm run seed"
fi
