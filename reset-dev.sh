#!/bin/bash

# Script para resetear el entorno de desarrollo cuando hay problemas de rate limiting

echo "🔄 Reseteando entorno de desarrollo..."

# Matar procesos de backend si están corriendo
echo "🛑 Deteniendo procesos del backend..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "node.*backend" 2>/dev/null || true

# Esperar un momento
sleep 2

# Limpiar cache de npm
echo "🧹 Limpiando cache..."
cd backend && npm cache clean --force 2>/dev/null || true

# Reinstalar dependencias si es necesario
if [ "$1" == "--full" ]; then
  echo "📦 Reinstalando dependencias..."
  rm -rf node_modules package-lock.json
  npm install
fi

# Iniciar servidor backend
echo "🚀 Iniciando servidor backend con rate limiting relajado..."
echo ""
echo "⚠️  CONFIGURACIÓN DE DESARROLLO:"
echo "   📊 API General: 1000 peticiones/15min"
echo "   🔐 Autenticación: 50 intentos/15min"
echo "   🚫 Estricto: 100 peticiones/15min"
echo ""
echo "🔧 Si sigues teniendo problemas 429:"
echo "   1. Verifica que NODE_ENV=development"
echo "   2. Reinicia completamente: ./reset-dev.sh --full"
echo "   3. Usa diferentes navegadores/pestañas incógnitas"
echo ""

npm run dev
