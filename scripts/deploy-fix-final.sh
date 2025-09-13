#!/bin/bash

# Script para hacer deployment completo con las correcciones finales
set -e

echo "🚀 Deploying final fix for axios and CORS..."

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

# Verificar que estamos en el directorio correcto
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    error "No se encontraron los directorios frontend y backend. Ejecuta desde el directorio raíz del proyecto."
fi

# 1. Deploy del Backend (CORS corregido)
log "1. Desplegando backend con CORS corregido..."
cd backend
git add .
git commit -m "Fix CORS to allow all Vercel URLs" || warn "No hay cambios en backend"
git push origin main
log "✅ Backend desplegado"

# 2. Deploy del Frontend (Axios corregido)
log "2. Desplegando frontend con axios corregido..."
cd ../frontend
git add .
git commit -m "Fix axios configuration to force /api/ prefix in all requests" || warn "No hay cambios en frontend"
git push origin main
log "✅ Frontend desplegado"

# 3. Esperar un momento para que se complete el deployment
log "3. Esperando que se complete el deployment..."
sleep 30

# 4. Probar las URLs
log "4. Probando las URLs del backend..."
cd ..
./scripts/test-backend-urls.sh

log "✅ Deployment completado!"
log "🌐 Frontend: https://tiendadiego.vercel.app"
log "🌐 Backend: https://tienda-diego-qkm5.onrender.com"
log "🔍 Revisa la consola del navegador para ver los logs de axios"
