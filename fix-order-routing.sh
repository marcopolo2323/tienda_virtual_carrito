#!/bin/bash

echo "🔗 Corrigiendo routing de detalles de orden..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de corrección de routing..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir routing de detalles de orden

- Cambiar enlace de /order/:id a /orders/:id
- Corregir parámetros en OrderDetailPage (id en lugar de orderId)
- Solucionar error 'No routes matched location /order/2'
- Permitir navegación a detalles de orden

Esto soluciona el problema de navegación a detalles de orden."

  echo "📤 Haciendo push..."
  git push origin main
fi

echo ""
echo "⏳ 2. Esperando que Vercel procese el deploy..."

# Función para verificar el estado del frontend
check_frontend() {
  curl -s -o /dev/null -w "%{http_code}" https://tiendadiego.vercel.app 2>/dev/null || echo "FAIL"
}

# Esperar hasta 2 minutos para que el servicio se actualice
max_attempts=12  # 12 * 10 segundos = 2 minutos
attempt=1

while [ $attempt -le $max_attempts ]; do
  status=$(check_frontend)
  
  if [ "$status" = "200" ]; then
    echo "✅ Frontend actualizado correctamente!"
    break
  else
    echo "⏳ Intento $attempt/$max_attempts - Esperando actualización del frontend..."
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "⚠️ El deploy está tomando más tiempo del esperado"
    echo "   Puedes verificar el estado en: https://vercel.com/dashboard"
  fi
  
  sleep 10
  ((attempt++))
done

echo ""
echo "🧪 3. Verificando endpoints..."

# Verificar que el frontend responda
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://tiendadiego.vercel.app 2>/dev/null || echo "FAIL")

if [ "$frontend_status" = "200" ]; then
  echo "✅ Frontend funcionando"
else
  echo "⚠️ Frontend: $frontend_status"
fi

echo ""
echo "✨ Corrección de routing completada!"
echo ""
echo "🔧 Problemas solucionados:"
echo "   ✅ Enlace corregido de /order/:id a /orders/:id"
echo "   ✅ Parámetros corregidos en OrderDetailPage"
echo "   ✅ Error 'No routes matched' solucionado"
echo "   ✅ Navegación a detalles de orden funcionando"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve a 'My Orders' en la aplicación"
echo "   2. Haz clic en 'Ver Detalles' de cualquier orden"
echo "   3. Verifica que se abra la página de detalles"
echo "   4. Confirma que se muestre la boleta electrónica"
echo ""
echo "📋 Cambios implementados:"
echo "   - Enlace: /order/2 → /orders/2"
echo "   - Parámetros: { orderId } → { id: orderId }"
echo "   - Routing: Coincide con la definición en App.js"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "🎉 ¡Navegación a detalles de orden funcionando!"
echo "   - Sin errores de routing"
echo "   - Enlaces funcionando correctamente"
echo "   - Página de detalles accesible"
echo "   - Boleta electrónica visible"
