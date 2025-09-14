#!/bin/bash

echo "🔒 Ajustando rate limiting para producción..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de ajustes de rate limiting..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Ajustar rate limiting para producción

- Aumentar límites de autenticación: 5 → 20 intentos/15min
- Aumentar límites de API general: 100 → 500 peticiones/15min  
- Aumentar límites estrictos: 10 → 50 peticiones/15min
- Mejorar logging de configuración de rate limits
- Mantener seguridad pero permitir uso normal de la aplicación

Esto soluciona el error 429 'Too Many Requests' en producción."

  echo "📤 Haciendo push..."
  git push origin main
fi

echo ""
echo "⏳ 2. Esperando que Render procese el deploy..."

# Función para verificar el estado del backend
check_backend() {
  curl -s -o /dev/null -w "%{http_code}" https://tienda-diego-qkm5.onrender.com/api/health 2>/dev/null || echo "FAIL"
}

# Esperar hasta 2 minutos para que el servicio se actualice
max_attempts=12  # 12 * 10 segundos = 2 minutos
attempt=1

while [ $attempt -le $max_attempts ]; do
  status=$(check_backend)
  
  if [ "$status" = "200" ]; then
    echo "✅ Backend actualizado correctamente!"
    break
  else
    echo "⏳ Intento $attempt/$max_attempts - Esperando actualización del backend..."
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "⚠️ El deploy está tomando más tiempo del esperado"
    echo "   Puedes verificar el estado en: https://dashboard.render.com/"
  fi
  
  sleep 10
  ((attempt++))
done

echo ""
echo "🧪 3. Verificando endpoints de autenticación..."

# Verificar que el endpoint de registro responda (debería dar 400 por datos faltantes, no 429)
register_status=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://tienda-diego-qkm5.onrender.com/api/auth/register 2>/dev/null || echo "FAIL")

if [ "$register_status" = "400" ] || [ "$register_status" = "422" ]; then
  echo "✅ Endpoint de registro funcionando (requiere datos válidos)"
elif [ "$register_status" = "429" ]; then
  echo "⚠️ Aún hay rate limiting - puede necesitar más tiempo para resetear"
else
  echo "ℹ️ Endpoint de registro: $register_status"
fi

echo ""
echo "✨ Rate limiting ajustado!"
echo ""
echo "📊 Nuevos límites en producción:"
echo "   🔐 Autenticación: 20 intentos cada 15 minutos"
echo "   📊 API General: 500 peticiones cada 15 minutos"
echo "   🚫 Endpoints estrictos: 50 peticiones cada 15 minutos"
echo ""
echo "🧪 Para probar:"
echo "   1. Intenta registrarte nuevamente"
echo "   2. El error 429 debería estar solucionado"
echo "   3. Si persiste, espera unos minutos para que se resetee el contador"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
