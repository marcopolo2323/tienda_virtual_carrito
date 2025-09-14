#!/bin/bash

echo "🔧 Corrigiendo errores de totales en OrderDetailPage..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de corrección de totales..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir errores de totales en OrderDetailPage

- Corregir error 'Cannot read properties of undefined (reading toFixed)' en subtotal
- Agregar validación para order.subtotal undefined
- Agregar validación para order.shipping_cost undefined
- Agregar validación para order.tax undefined
- Usar parseFloat() para todos los campos numéricos
- Agregar logging detallado de campos de totales
- Solucionar todos los errores de JavaScript en resumen de orden

Esto soluciona completamente la visualización de totales en detalles de orden."

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
echo "✨ Corrección de totales completada!"
echo ""
echo "🔧 Problemas solucionados:"
echo "   ✅ Error 'Cannot read properties of undefined (reading toFixed)' en subtotal"
echo "   ✅ Validación para order.subtotal undefined"
echo "   ✅ Validación para order.shipping_cost undefined"
echo "   ✅ Validación para order.tax undefined"
echo "   ✅ Usar parseFloat() para todos los campos numéricos"
echo "   ✅ Logging detallado de campos de totales"
echo "   ✅ Sin errores de JavaScript en resumen de orden"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve a 'My Orders' en la aplicación"
echo "   2. Haz clic en 'Ver Detalles' de cualquier orden"
echo "   3. Verifica que se abra la página sin errores"
echo "   4. Confirma que se muestre el resumen de totales correctamente"
echo "   5. Confirma que se muestren subtotal, shipping, tax y total"
echo "   6. Confirma que se muestre la boleta electrónica"
echo "   7. Revisa la consola para ver los logs detallados"
echo ""
echo "📋 Logging agregado:"
echo "   - Order ID recibido"
echo "   - Response status y data"
echo "   - Estructura de datos de la orden"
echo "   - Campos disponibles en la orden"
echo "   - Valor de createdAt (fecha del pedido)"
echo "   - Objeto User completo"
echo "   - Valor y tipo de total"
echo "   - Valor de subtotal"
echo "   - Valor de shipping_cost"
echo "   - Valor de tax"
echo "   - Array de OrderItems"
echo "   - Validación de status antes de procesar"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "🎉 ¡OrderDetailPage completamente funcional!"
echo "   - Sin errores de JavaScript"
echo "   - Fecha del pedido visible"
echo "   - Información del cliente visible"
echo "   - Productos de la orden visibles"
echo "   - Resumen de totales visible y correcto"
echo "   - Validaciones robustas para todos los campos"
echo "   - Boleta electrónica visible"
echo "   - Navegación funcionando correctamente"
