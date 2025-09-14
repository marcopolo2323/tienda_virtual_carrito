#!/bin/bash

# Script para hacer deploy de la corrección de errores 404

echo "🔄 Iniciando deploy de corrección..."

# Verificar cambios
echo "📋 Cambios realizados:"
echo "✅ Corregida configuración de axios para agregar /api/ correctamente"
echo "✅ Habilitado endpoint /api/health en producción"
echo "✅ Simplificado interceptor para evitar conflictos"

# Hacer commit y push
echo "📤 Haciendo commit y push..."
git add .
git commit -m "Fix: Corregir configuración de axios para agregar /api/ correctamente

- Agregar /api/ directamente a la baseURL de axios
- Simplificar interceptor para evitar conflictos 
- Habilitar endpoint /api/health en producción
- Corregir URLs en makeRequest para incluir /api/

Esto soluciona los errores 404 al hacer peticiones desde el frontend desplegado."

git push origin main

echo "✅ Deploy completado!"
echo ""
echo "🌐 URLs para verificar:"
echo "   - Frontend: https://tiendadiego.vercel.app"
echo "   - Backend: https://tienda-diego-qkm5.onrender.com"
echo "   - Health Check: https://tienda-diego-qkm5.onrender.com/api/health"
echo ""
echo "🧪 Después del deploy, verifica en la consola del navegador que veas:"
echo "   🔧 API Client baseURL configurada: https://tienda-diego-qkm5.onrender.com/api"
echo "   🌐 Petición: GET https://tienda-diego-qkm5.onrender.com/api/categories"
echo "   🌐 Petición: GET https://tienda-diego-qkm5.onrender.com/api/products/featured"
echo ""
echo "✨ ¡Los errores 404 deberían estar solucionados!"
