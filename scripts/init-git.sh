#!/bin/bash

# Script de inicialización de Git
set -e

echo "🚀 Inicializando repositorio Git..."

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

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    log "Inicializando repositorio Git..."
    git init
else
    log "Repositorio Git ya existe"
fi

# Configurar Git (si no está configurado)
if [ -z "$(git config user.name)" ]; then
    warn "Configuración de Git no encontrada"
    read -p "Ingresa tu nombre: " git_name
    read -p "Ingresa tu email: " git_email
    git config user.name "$git_name"
    git config user.email "$git_email"
    log "Configuración de Git guardada"
fi

# Agregar archivos al staging
log "Agregando archivos al staging..."
git add .

# Hacer commit inicial
log "Creando commit inicial..."
git commit -m "Initial commit: Tienda Virtual setup

- Frontend React con Vercel
- Backend Node.js/Express con Render
- Base de datos PostgreSQL
- Configuración de seguridad
- Scripts de deployment
- Documentación completa"

# Mostrar estado
info "📊 Estado del repositorio:"
git status

info "📋 Comandos útiles:"
info "  Ver historial: git log --oneline"
info "  Ver cambios: git diff"
info "  Agregar cambios: git add . && git commit -m 'mensaje'"
info "  Push a remoto: git remote add origin <url> && git push -u origin main"

log "✅ Repositorio Git inicializado exitosamente!"
