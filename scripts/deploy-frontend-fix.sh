#!/bin/bash

# Script para hacer deployment del frontend con las correcciones de axios
set -e

echo "🚀 Desplegando frontend con correcciones de axios..."

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
if [ ! -f "frontend/package.json" ]; then
    error "No se encontró frontend/package.json. Ejecuta desde el directorio raíz del proyecto."
fi

# Navegar al directorio frontend
cd frontend

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    warn "Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
fi

# Verificar que estemos logueados en Vercel
if ! vercel whoami &> /dev/null; then
    error "No estás logueado en Vercel. Ejecuta 'vercel login' primero."
fi

# Hacer commit de los cambios
log "Haciendo commit de los cambios..."
git add .
git commit -m "Fix axios interceptor to automatically add /api/ prefix" || warn "No hay cambios para commitear"

# Push a GitHub
log "Haciendo push a GitHub..."
git push origin main

# Deploy a Vercel
log "Desplegando a Vercel..."
vercel --prod

log "✅ Deployment completado!"
log "🌐 Verifica tu aplicación en: https://tiendadiego.vercel.app"
log "🔍 Revisa la consola del navegador para ver los logs de axios"
