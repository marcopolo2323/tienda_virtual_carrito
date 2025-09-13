#!/bin/bash

# Script de deployment para Vercel + Render
set -e

echo "🚀 Iniciando deployment para Vercel + Render..."

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
    error "No se encontraron los archivos package.json. Ejecuta este script desde la raíz del proyecto."
fi

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    log "Instalando Vercel CLI..."
    npm install -g vercel
fi

# Verificar que Render CLI esté instalado
if ! command -v render &> /dev/null; then
    warn "Render CLI no está instalado. Instálalo desde: https://render.com/docs/cli"
fi

# 1. Configurar Frontend para Vercel
log "Configurando frontend para Vercel..."

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    log "Instalando Vercel CLI..."
    npm install -g vercel
fi

# Verificar variables de entorno en Vercel
log "Verificando variables de entorno en Vercel..."
vercel env ls 2>/dev/null || warn "No se pudieron obtener las variables de entorno"

# Mostrar instrucciones para configurar variables
info "📋 IMPORTANTE: Configura estas variables en Vercel:"
info "1. Ve a https://vercel.com/dashboard"
info "2. Selecciona tu proyecto"
info "3. Ve a Settings → Environment Variables"
info "4. Agrega:"
info "   - REACT_APP_API_BASE_URL: https://tienda-diego-qkm5.onrender.com"
info "   - REACT_APP_NAME: Tienda Virtual"
info "   - REACT_APP_VERSION: 1.0.0"
info "5. Haz un nuevo deployment después de configurar las variables"

# Build del frontend
log "Construyendo frontend..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    error "Error en el build del frontend"
fi

# Deploy a Vercel
log "Desplegando frontend a Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    error "Error en el deployment a Vercel"
fi

cd ..

# 2. Configurar Backend para Render
log "Configurando backend para Render..."

# Crear archivo .env para Render
if [ ! -f "backend/.env" ]; then
    log "Creando archivo .env para Render..."
    cat > backend/.env << EOF
# Configuración para Render
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
CORS_ORIGIN=https://tu-frontend-en-vercel.vercel.app
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
EOF
    warn "Por favor configura las variables en backend/.env"
fi

# Instalar dependencias del backend
log "Instalando dependencias del backend..."
cd backend
npm install --production

cd ..

# 3. Mostrar información de deployment
info "📊 Información de deployment:"
info "  Frontend: Desplegado en Vercel"
info "  Backend: Configurado para Render"
info "  Base de datos: PostgreSQL en Render"

info "📝 URLs de acceso:"
info "  Frontend: https://tu-frontend-en-vercel.vercel.app"
info "  Backend: https://tu-backend-en-render.onrender.com"
info "  API Health: https://tu-backend-en-render.onrender.com/api/health"

info "📋 Próximos pasos:"
info "  1. Configura las variables de entorno en Render"
info "  2. Actualiza REACT_APP_API_BASE_URL en Vercel"
info "  3. Configura CORS_ORIGIN en Render con tu URL de Vercel"
info "  4. Verifica que ambos servicios estén funcionando"

log "✅ Configuración para Vercel + Render completada!"
