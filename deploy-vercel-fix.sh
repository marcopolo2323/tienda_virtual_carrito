#!/bin/bash

echo "🚀 Desplegando corrección de Vercel..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de correcciones..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir vercel.json y limpiar archivos innecesarios

- Cambiar routes por rewrites para evitar conflicto
- Eliminar archivos de documentación temporal
- Limpiar scripts duplicados
- Asegurar que axios use URLs correctas en producción"

  echo "📤 Haciendo push..."
  git push origin main
fi

echo ""
echo "⏳ 2. Esperando que Vercel procese el deploy..."
echo "   Esto puede tomar 1-2 minutos"

# Función para verificar el estado del frontend
check_frontend() {
  curl -s -o /dev/null -w "%{http_code}" https://tiendadiego.vercel.app/ 2>/dev/null || echo "FAIL"
}

# Esperar hasta 2 minutos para que el servicio esté disponible
max_attempts=12  # 12 * 10 segundos = 2 minutos
attempt=1

while [ $attempt -le $max_attempts ]; do
  status=$(check_frontend)
  
  if [ "$status" = "200" ]; then
    echo "✅ Frontend desplegado correctamente!"
    break
  else
    echo "⏳ Intento $attempt/$max_attempts - Esperando deploy..."
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "⚠️ El deploy está tomando más tiempo del esperado"
    echo "   Puedes verificar el estado en: https://vercel.com/dashboard"
  fi
  
  sleep 10
  ((attempt++))
done

echo ""
echo "🧪 3. Verificando que las URLs sean correctas..."
echo "   Abre la consola del navegador (F12) y verifica que veas:"
echo "   🔧 API Client baseURL configurada: https://tienda-diego-qkm5.onrender.com/api"
echo "   🌐 Petición: GET https://tienda-diego-qkm5.onrender.com/api/categories"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "✨ Si aún ves errores 404, espera unos minutos más o usa Ctrl+F5 para forzar recarga"
