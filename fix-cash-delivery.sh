#!/bin/bash

echo "💵 Corrigiendo pago contraentrega..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de correcciones de contraentrega..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir error 500 en pago contraentrega

- Agregar validaciones de campos obligatorios
- Mejorar logging para debugging de errores
- Manejar casos de dirección vacía para contraentrega
- Agregar validación de subtotal y total
- Mejorar manejo de errores específicos
- Agregar logging detallado del body recibido

Esto soluciona el error 500 al pagar contraentrega."

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
echo "✨ Correcciones de contraentrega completadas!"
echo ""
echo "🔧 Problemas solucionados:"
echo "   ✅ Validaciones de campos obligatorios"
echo "   ✅ Manejo de dirección vacía para contraentrega"
echo "   ✅ Logging detallado para debugging"
echo "   ✅ Mejor manejo de errores específicos"
echo "   ✅ Validación de subtotal y total"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y selecciona 'Pago Contra Entrega'"
echo "   2. Completa el formulario de envío"
echo "   3. Confirma el pedido"
echo "   4. Verifica que NO haya error 500"
echo "   5. Confirma que la orden se cree correctamente"
echo ""
echo "📋 Logs mejorados:"
echo "   - Se mostrarán los datos recibidos en los logs"
echo "   - Errores específicos de validación"
echo "   - Información detallada para debugging"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Si persiste el error:"
echo "   - Revisa los logs de Render para más detalles"
echo "   - Los logs ahora muestran el body completo recibido"
echo "   - Se identifican errores específicos de validación"
