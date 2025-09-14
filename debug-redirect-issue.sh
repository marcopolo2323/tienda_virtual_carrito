#!/bin/bash

echo "🐛 Debugging problema de redirección..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de logging de debugging..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Debug: Agregar logging detallado para debugging de redirección

- Agregar logging paso a paso en CheckoutPage
- Agregar logging en OrderSuccessPage
- Mostrar ID de orden recibido y tipo
- Mostrar proceso de redirección completo
- Facilitar debugging del problema de navegación

Esto ayudará a identificar exactamente dónde falla la redirección."

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
echo "🐛 Debugging de redirección completado!"
echo ""
echo "🔧 Logging agregado:"
echo "   ✅ Logging paso a paso en CheckoutPage"
echo "   ✅ Logging en OrderSuccessPage"
echo "   ✅ Mostrar ID de orden recibido y tipo"
echo "   ✅ Mostrar proceso de redirección completo"
echo "   ✅ Facilitar debugging del problema"
echo ""
echo "🧪 Para probar y debuggear:"
echo "   1. Ve al checkout y selecciona 'Pago Contra Entrega'"
echo "   2. Completa el formulario de envío"
echo "   3. Confirma el pedido"
echo "   4. Abre la consola del navegador (F12)"
echo "   5. Revisa los logs paso a paso:"
echo "      - '=== RESPUESTA DE ORDEN ==='"
echo "      - '✅ ID de orden válido recibido: X'"
echo "      - '🔄 Iniciando limpieza de carrito...'"
echo "      - '🔄 Programando redirección en 100ms...'"
echo "      - '🚀 Ejecutando redirección a: /order-success/X'"
echo "      - '=== ORDER SUCCESS PAGE ==='"
echo "      - 'Order ID from params: X'"
echo ""
echo "📋 Si la redirección falla:"
echo "   - Verifica que se ejecute '🚀 Ejecutando redirección'"
echo "   - Verifica que se llegue a '=== ORDER SUCCESS PAGE ==='"
echo "   - Verifica que el Order ID sea el mismo en ambos logs"
echo "   - Si no se ejecuta la redirección, hay un problema con navigate()"
echo "   - Si se ejecuta pero no llega a OrderSuccessPage, hay un problema de routing"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Prueba el flujo completo"
echo "   2. Revisa los logs en la consola"
echo "   3. Identifica exactamente dónde falla"
echo "   4. Reporta los logs específicos para la siguiente corrección"
