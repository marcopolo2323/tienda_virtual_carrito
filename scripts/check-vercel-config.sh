#!/bin/bash

# Script para verificar la configuración de Vercel
set -e

echo "🔍 Verificando configuración de Vercel..."

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
if [ ! -f "vercel.json" ]; then
    error "No se encontró vercel.json. Ejecuta este script desde la raíz del proyecto."
fi

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    warn "Vercel CLI no está instalado. Instálalo con: npm install -g vercel"
    exit 1
fi

log "Verificando configuración de Vercel..."

# Verificar variables de entorno en Vercel
info "Variables de entorno en Vercel:"
vercel env ls 2>/dev/null || warn "No se pudieron obtener las variables de entorno"

# Verificar configuración del proyecto
info "Configuración del proyecto:"
vercel project ls 2>/dev/null || warn "No se pudieron obtener los proyectos"

# Verificar deployments recientes
info "Deployments recientes:"
vercel ls --limit 5 2>/dev/null || warn "No se pudieron obtener los deployments"

# Mostrar instrucciones para configurar variables de entorno
info "📋 Para configurar las variables de entorno en Vercel:"
info "1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard"
info "2. Selecciona tu proyecto"
info "3. Ve a Settings → Environment Variables"
info "4. Agrega estas variables:"
info "   - REACT_APP_API_BASE_URL: https://tienda-diego-qkm5.onrender.com"
info "   - REACT_APP_NAME: Tienda Virtual"
info "   - REACT_APP_VERSION: 1.0.0"
info "5. Haz un nuevo deployment"

# Verificar que el backend esté funcionando
info "Verificando que el backend esté funcionando..."
if curl -f https://tienda-diego-qkm5.onrender.com/api/health > /dev/null 2>&1; then
    log "✅ Backend está funcionando"
else
    warn "⚠️ Backend no está respondiendo. Verifica que esté desplegado en Render"
fi

log "✅ Verificación completada"
