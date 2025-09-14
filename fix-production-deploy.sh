#!/bin/bash

echo "🚀 Solucionando problemas de producción..."
echo ""

# Paso 1: Hacer commit y push de cambios
echo "📤 1. Haciendo deploy de los últimos cambios..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corrección completa de axios y configuración de producción

- Corregir imports de axios en todos los componentes
- Ajustar rate limiting para desarrollo
- Habilitar health check en producción
- Solucionar errores 404 en peticiones del frontend
- Configurar URLs correctas para desarrollo y producción

Esto debería solucionar los errores 404 tanto en local como en producción."

  echo "📤 Haciendo push..."
  git push origin main
  
  if [ $? -eq 0 ]; then
    echo "✅ Deploy iniciado correctamente"
  else
    echo "❌ Error al hacer push - verifica tu configuración de git"
    exit 1
  fi
fi

echo ""
echo "⏳ 2. Esperando que Render procese el deploy (esto puede tomar 2-3 minutos)..."

# Función para verificar el estado del backend
check_backend() {
  curl -s -o /dev/null -w "%{http_code}" https://tienda-diego-qkm5.onrender.com/ 2>/dev/null || echo "FAIL"
}

# Esperar hasta 3 minutos para que el servicio esté disponible
max_attempts=18  # 18 * 10 segundos = 3 minutos
attempt=1

while [ $attempt -le $max_attempts ]; do
  status=$(check_backend)
  
  if [ "$status" = "200" ]; then
    echo "✅ Backend está respondiendo correctamente!"
    break
  elif [ "$status" = "502" ]; then
    echo "⏳ Intento $attempt/$max_attempts - Backend aún reiniciando (502)..."
  elif [ "$status" = "FAIL" ]; then
    echo "⏳ Intento $attempt/$max_attempts - Backend no responde..."
  else
    echo "⏳ Intento $attempt/$max_attempts - Estado: $status"
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Backend no respondió después de 3 minutos"
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   1. Revisar logs en Render Dashboard"
    echo "   2. Verificar variables de entorno"
    echo "   3. Verificar conexión a la base de datos"
    echo "   4. Reiniciar manualmente el servicio en Render"
    echo ""
    echo "🌐 Render Dashboard: https://dashboard.render.com/"
    exit 1
  fi
  
  sleep 10
  ((attempt++))
done

echo ""
echo "🌱 3. Poblando la base de datos..."

# Intentar poblar la base de datos
seed_status=$(curl -s -o /dev/null -w "%{http_code}" -X GET https://tienda-diego-qkm5.onrender.com/api/seed)

if [ "$seed_status" = "200" ]; then
  echo "✅ Base de datos poblada correctamente"
else
  echo "⚠️ Problema al poblar la BD (código: $seed_status)"
  echo "   Puedes intentar manualmente: curl -X GET https://tienda-diego-qkm5.onrender.com/api/seed"
fi

echo ""
echo "🧪 4. Verificando endpoints principales..."

endpoints=(
  "/api/health:Health Check"
  "/api/products:Productos"
  "/api/categories:Categorías"  
  "/api/banners/active:Banners"
  "/api/products/featured:Productos Destacados"
)

all_ok=true

for item in "${endpoints[@]}"; do
  endpoint=$(echo "$item" | cut -d: -f1)
  name=$(echo "$item" | cut -d: -f2)
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://tienda-diego-qkm5.onrender.com$endpoint" 2>/dev/null)
  
  if [ "$status" = "200" ]; then
    echo "✅ $name ($endpoint)"
  else
    echo "❌ $name ($endpoint) - $status"
    all_ok=false
  fi
done

echo ""
if [ "$all_ok" = true ]; then
  echo "🎉 ¡Todos los servicios están funcionando correctamente!"
  echo ""
  echo "🌐 URLs de tu aplicación:"
  echo "   Frontend: https://tiendadiego.vercel.app"
  echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
  echo ""
  echo "✨ Tu tienda virtual debería estar funcionando sin errores 404"
else
  echo "⚠️ Algunos endpoints aún tienen problemas"
  echo "   Revisa los logs de Render para más detalles"
fi
