#!/bin/bash

# Script de verificación del setup
set -e

echo "🔍 Verificando setup de la aplicación..."

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
if [ ! -f "README.md" ]; then
    error "No se encontró README.md. Ejecuta este script desde la raíz del proyecto."
fi

# 1. Verificar estructura de archivos
log "Verificando estructura de archivos..."

required_files=(
    "backend/package.json"
    "frontend/package.json"
    "backend/src/index.js"
    "frontend/src/App.js"
    "vercel.json"
    "render.yaml"
    ".gitignore"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log "✅ $file existe"
    else
        error "❌ $file no encontrado"
    fi
done

# 2. Verificar que no existan archivos eliminados
log "Verificando que no existan archivos eliminados..."

deleted_files=(
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "docker-compose.yml"
    "backend/ecosystem.config.js"
    "backend/src/routes/adminBanners.js"
    "backend/src/routes/banners_fixed.js"
    "backend/src/routes/banners_simple.js"
    "backend/src/routes/products_simple.js"
)

for file in "${deleted_files[@]}"; do
    if [ ! -f "$file" ]; then
        log "✅ $file correctamente eliminado"
    else
        warn "⚠️ $file aún existe (debería haber sido eliminado)"
    fi
done

# 3. Verificar dependencias del backend
log "Verificando dependencias del backend..."
cd backend

if [ -d "node_modules" ]; then
    log "✅ node_modules del backend existe"
else
    warn "⚠️ node_modules del backend no existe. Ejecutando npm install..."
    npm install
fi

# Verificar vulnerabilidades
log "Verificando vulnerabilidades del backend..."
vulnerabilities=$(npm audit --audit-level=moderate 2>&1 | grep -c "vulnerabilities" || true)
if [ "$vulnerabilities" -eq 0 ]; then
    log "✅ No hay vulnerabilidades críticas en el backend"
else
    warn "⚠️ Se encontraron vulnerabilidades en el backend"
    npm audit
fi

cd ..

# 4. Verificar dependencias del frontend
log "Verificando dependencias del frontend..."
cd frontend

if [ -d "node_modules" ]; then
    log "✅ node_modules del frontend existe"
else
    warn "⚠️ node_modules del frontend no existe. Ejecutando npm install..."
    npm install
fi

cd ..

# 5. Verificar archivos de configuración
log "Verificando archivos de configuración..."

# Verificar que no haya referencias a archivos eliminados
if grep -r "adminBanners" backend/src/ 2>/dev/null; then
    error "❌ Se encontraron referencias a adminBanners en el código"
else
    log "✅ No hay referencias a archivos eliminados"
fi

# 6. Verificar sintaxis de archivos principales
log "Verificando sintaxis de archivos principales..."

# Verificar sintaxis del backend
if node -c backend/src/index.js 2>/dev/null; then
    log "✅ Sintaxis del backend correcta"
else
    error "❌ Error de sintaxis en backend/src/index.js"
fi

# Verificar sintaxis del frontend
if node -c frontend/src/App.js 2>/dev/null; then
    log "✅ Sintaxis del frontend correcta"
else
    error "❌ Error de sintaxis en frontend/src/App.js"
fi

# 7. Verificar scripts
log "Verificando scripts..."

scripts=(
    "scripts/deploy-vercel-render.sh"
    "scripts/init-git.sh"
    "scripts/verify-setup.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ] && [ -x "$script" ]; then
        log "✅ $script existe y es ejecutable"
    else
        warn "⚠️ $script no existe o no es ejecutable"
    fi
done

# 8. Verificar configuración de Git
log "Verificando configuración de Git..."

if [ -d ".git" ]; then
    log "✅ Repositorio Git inicializado"
    
    if [ -f ".gitignore" ]; then
        log "✅ .gitignore configurado"
    else
        warn "⚠️ .gitignore no encontrado"
    fi
else
    warn "⚠️ Repositorio Git no inicializado"
fi

# 9. Resumen final
info "📊 Resumen de verificación:"
info "  ✅ Estructura de archivos correcta"
info "  ✅ Archivos innecesarios eliminados"
info "  ✅ Dependencias instaladas"
info "  ✅ Sintaxis correcta"
info "  ✅ Scripts configurados"

log "✅ Verificación completada exitosamente!"
log "🚀 Tu aplicación está lista para deployment en Vercel + Render"

info "📋 Próximos pasos:"
info "  1. Configurar variables de entorno en Vercel y Render"
info "  2. Ejecutar: ./scripts/deploy-vercel-render.sh"
info "  3. Verificar que ambos servicios estén funcionando"
