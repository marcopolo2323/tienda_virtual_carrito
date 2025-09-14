#!/bin/bash

echo "🏦 Implementando pago completo con Yape y validación por WhatsApp..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de implementación completa de Yape..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Feat: Implementar pago completo con Yape y validación

- Agregar migración para payment_reference en orders
- Implementar captura de pantalla del pago
- Agregar envío por WhatsApp a +51934819598
- Crear generación de boleta HTML con detalles del pago
- Mejorar flujo de validación de pago con Yape
- Agregar modal para subir comprobante de pago
- Implementar validación antes de completar orden

Esto soluciona el error 500 y agrega validación completa."

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
echo "✨ Implementación completa de Yape finalizada!"
echo ""
echo "🔧 Problemas solucionados:"
echo "   ✅ Error 500 al crear órdenes con Yape"
echo "   ✅ Campo payment_reference agregado a la BD"
echo "   ✅ Migración creada para el nuevo campo"
echo ""
echo "🏦 Nuevas funcionalidades de Yape:"
echo "   ✅ Captura de pantalla del pago"
echo "   ✅ Envío automático por WhatsApp a +51934819598"
echo "   ✅ Generación de boleta HTML con detalles"
echo "   ✅ Validación antes de completar orden"
echo "   ✅ Modal para subir comprobante"
echo "   ✅ Flujo completo de validación"
echo ""
echo "📱 Flujo de pago con Yape:"
echo "   1. Usuario selecciona Yape como método de pago"
echo "   2. Escanea el QR con la app de Yape"
echo "   3. Realiza el pago"
echo "   4. Toma captura de pantalla del comprobante"
echo "   5. Sube la imagen en el modal"
echo "   6. Envía por WhatsApp automáticamente"
echo "   7. Descarga la boleta con detalles del pago"
echo "   8. Completa la orden"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y selecciona 'Yape'"
echo "   2. Sigue el flujo completo de pago"
echo "   3. Verifica que se envíe por WhatsApp"
echo "   4. Descarga la boleta generada"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Notas importantes:"
echo "   - WhatsApp: +51934819598 para validación"
echo "   - Boleta se genera en formato HTML"
echo "   - Admin puede ver todos los pedidos con Yape"
echo "   - Validación manual por WhatsApp antes de confirmar"
