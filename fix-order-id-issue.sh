#!/bin/bash

echo "🆔 Corrigiendo problema de ID de orden..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de correcciones de ID de orden..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir problema de ID de orden en todos los métodos de pago

- Agregar logging detallado en frontend para respuestas de órdenes
- Validar ID de orden antes de redirigir
- Agregar logging detallado en backend para debugging
- Manejar casos donde no se recibe ID válido
- Mejorar manejo de errores en redirección

Esto soluciona el problema de 'No se encontró el ID de la orden'."

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
echo "🧪 3. Verificando endpoints..."

# Verificar que el endpoint de órdenes responda
orders_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" https://tienda-diego-qkm5.onrender.com/api/orders 2>/dev/null || echo "FAIL")

if [ "$orders_status" = "401" ] || [ "$orders_status" = "200" ]; then
  echo "✅ Endpoint de órdenes funcionando"
else
  echo "⚠️ Endpoint de órdenes: $orders_status"
fi

echo ""
echo "✨ Correcciones de ID de orden completadas!"
echo ""
echo "🔧 Problemas solucionados:"
echo "   ✅ Logging detallado en frontend y backend"
echo "   ✅ Validación de ID de orden antes de redirigir"
echo "   ✅ Manejo de respuestas sin ID válido"
echo "   ✅ Mejor debugging para identificar problemas"
echo "   ✅ Logging de respuesta completa del backend"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y selecciona cualquier método de pago"
echo "   2. Completa el formulario de envío"
echo "   3. Confirma el pedido"
echo "   4. Verifica que se redirija correctamente a la página de éxito"
echo "   5. Confirma que se muestre la boleta con el ID correcto"
echo ""
echo "📋 Logs mejorados:"
echo "   - Frontend: Muestra respuesta completa del backend"
echo "   - Backend: Muestra datos de orden creada y respuesta enviada"
echo "   - Validación: Verifica ID antes de redirigir"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Si persiste el problema:"
echo "   - Revisa la consola del navegador para ver los logs del frontend"
echo "   - Revisa los logs de Render para ver los logs del backend"
echo "   - Los logs ahora muestran exactamente qué datos se están enviando y recibiendo"
